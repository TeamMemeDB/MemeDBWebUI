import clientPromise from "../../lib/mongodb";
import { Query } from "../../lib/memedb";
import { Db } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

//TODO: add a best match sort mode
const sortMode = {
  new: {uploadDate: -1},
  old: {uploadDate: 1},
  top: {totalVotes: -1, uploadDate: -1},
  bottom: {totalVotes: 1, uploadDate: -1}
}

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  if(req.method != 'GET')
    return res.status(405);
  const client = await clientPromise;
  const db = client.db("memedb");
  // Parse data from GET request with defaults
  // While it's technically possible to include and exclude the same type of property simultaneously, this is not supported.
  const result = await getMemes(db, Query.create(req.query));
  res.json(result || {matches: 0});
}

export async function getMemes(db:Db, query=Query.create({})) {
  if(query.edge > 1) {
    return {matches: 0, errorMessage: "Authorization is required to view these memes."};
  }

  // Sort through tag ids, if they start with a minus, exclude them from results
  const includeTags:number[] = [];
  const excludeTags:number[] = [];
  if(query.tags.length == 0) return {matches:0};
  if(query.tags.indexOf('all')==-1) {
    (query.tags as number[]).forEach(tag => {
      if(tag < 0) excludeTags.push(tag * -1);
      else includeTags.push(tag);
    });
  }
  // The same with categories
  const includeCats:number[] = [];
  const excludeCats:number[] = [];
  if(query.categories.length == 0) return {matches:0};
  if(query.categories.indexOf('all')==-1){
    (query.categories as number[]).forEach(category => {
      if(category < 0) excludeCats.push(category * -1);
      else includeCats.push(category);
    });
  }

  // The actual query sent to MongoDB
  const pipeline = [
    {
      $match: {
        // Hide unrated memes
        ...(query.edge < 5? {edgevotes: {$exists: true}}: {})
      }
    },
    {
      $addFields: {
        // An average of all upvotes and downvotes for this meme
        totalVotes: {$sum: "$votes.value"},
        // An average of all edge ratings for this meme
        avgEdgevotes: {$avg: "$edgevotes.value"},
        // Take the best description and provide it for search
        topDescription: {$ifNull: [
          {$arrayElemAt: [{$map: {
            input: "$descriptions", in: {$cond: [{$eq: ["$$this.votes.value", {$max: "$descriptions.votes.value"}]}, "$$this.description", null]}
          }},0]},
          null
        ]},
        descriptionAuthor: {$ifNull: [
          {$arrayElemAt: [{$map: {
            input: "$descriptions", in: {$cond: [{$eq: ["$$this.votes.value", {$max: "$descriptions.votes.value"}]}, "$$this.author", null]}
          }},0]},
          null
        ]},
        // Take the best transcription and provide it for search
        topTranscription: {$ifNull: [
          {$arrayElemAt: [{$map:{
            input: "$transcriptions", in: {$cond: [{$eq: ["$$this.votes.value", {$max: "$transcriptions.votes.value"}]}, "$$this.transcription", null]}
          }},0]},
          null
        ]},
        transcriptionAuthor: {$ifNull: [
          {$arrayElemAt: [{$map:{
            input: "$transcriptions", in: {$cond: [{$eq: ["$$this.votes.value", {$max: "$transcriptions.votes.value"}]}, "$$this.author", null]}
          }},0]},
          null
        ]},
        // Take tags that are upvoted more than downvoted and include them in metadata
        topTags: {$ifNull: [{$map: {input: {$filter: {
            input: "$tags", as: "tag", cond: {$gt: [{$sum: "$$tag.votes.value"}, 0]}
          }}, as: "tag", in: "$$tag.tag"
        }}, []]},
        // Take categories that are upvoted more than downvoted and include them in metadata
        topCategories: {$ifNull: [{$map: {input: {$filter: {
            input: "$categories", as: "category", cond: {$gt: [{$sum: "$$category.votes.value"}, 0]}
          }}, as: "category", in: "$$category.category"
        }}, []]}
      }
    },
    // Find the authors of the topDescription and topTranscription
    {
      $lookup: {
        from: "user",
        localField: "transcriptionAuthor",
        foreignField: "_id",
        as: "transcriptionAuthorInfo"
      }
    },
    {
      $lookup: {
        from: "user",
        localField: "descriptionAuthor",
        foreignField: "_id",
        as: "descriptionAuthorInfo"
      }
    },
    {
      $addFields: {
        descriptionAuthor: { $arrayElemAt: ["$descriptionAuthorInfo.username", 0] },
        transcriptionAuthor: { $arrayElemAt: ["$transcriptionAuthorInfo.username", 0] },
      }
    },
    {
      $project: {
        descriptionAuthorInfo: 0,
        transcriptionAuthorInfo: 0
      }
    },
    {
      // Exclude irrelevant data to decrease data usage and latency
      // urls and originalUrls are excluded to help reduce vulnerability to scraping
      $unset: ['downloader', 'votes', 'edgevotes', 'descriptions', 'transcriptions', 'tags', 'categories', 'discordOrigin', 'originalUrl', 'originalUrls']
    },
    {
      $match: {
        // Takes edge ratings by majority rule, favouring caution
        ...(query.edge < 5? {avgEdgevotes: {$gte: Number(query.edge)-0.5, $lt: Number(query.edge)+0.5 }} : {edgevotes: {$eq: []}}),
        "flags.hidden": false,
        // Tag filtering
        ...(query.tags[0]=='all' ? {}: (includeTags.length ? {topTags: {$in: includeTags}} : {topTags: {$nin: excludeTags}})),
        // Category filtering
        ...(query.categories[0]=='all' ? {} : (includeCats.length ? {topCategories: {$in: includeCats}} : {topCategories: {$nin: excludeCats}})),
        // Text search
        ...(query.filter? {$or: [
          { topDescription: { $regex: query.filter, $options: 'i' } },
          { topTranscription: { $regex: query.filter, $options: 'i' } },
        ]}: {})
      }
    },
    {
      // Use the provided ruleset for sorting memes
      $sort: sortMode[query.sort]
    },
    {
      $group: {
        _id: null,
        // Include a result count for pagination
        matches: {$sum: 1},
        // Pagination
        memes: {$push: "$$ROOT"}
      }
    },
    {
      $project: {
        _id: 0,
        matches: 1,
        memes: {$slice: ["$memes", Number(query.from), query.limit]}
      }
    }
  ];
  const result = await db.collection("meme").aggregate(pipeline).toArray();
  if(result.length) return result[0];
  return {matches:0};
}