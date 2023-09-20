import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

const sortMode = {
  new: {uploadDate: -1},
  old: {uploadDate: 1},
  top: {avgVotes: 1, uploadDate: -1},
  bottom: {avgVotes: -1, uploadDate: -1}
}

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("memedb");
  switch (req.method) {
    case "GET":
      // Parse data from GET request with defaults
      // While it's technically possible to include and exclude the same type of property simultaneously, this is not supported.
      const result = await getMemes(db, req.query);
      res.json(result);
      break;
  }
}

export async function getMemes(db, query={}) {
  const { sort = 'new', categories = 'all', tags = 'all', edge = 0, from = 0 } = query;

  // Sort through tag ids, if they start with a minus, exclude them from results
  const inclusivetags = [];
  const exclusivetags = [];
  if(tags!='all') {
    tags.split(',').forEach(tag => {
      if(tag.charAt(0) == '-') exclusivetags.push(ObjectId(tag.substring(1)));
      else inclusivetags.push(ObjectId(tag));
    });
  }
  // The same with categories
  const inclusivecats = [];
  const exclusivecats = [];
  if(categories!='all'){
    categories.split(',').forEach(category => {
      if(category.charAt(0) == '-') exclusivecats.push(ObjectId(category.substring(1)));
      else inclusivecats.push(ObjectId(category));
    });
  }

  //console.log(`Retrieving edge-${edge} memes with ${tags} tags, ${categories} categories, sort mode ${sort}, skipping ${from} results`);
  // The actual query sent to MongoDB
  const pipeline = [
    {
      $match: {
        // Hide unrated memes
        edgevotes: {$exists: true},
      }
    },
    {
      $addFields: {
        // An average of all upvotes and downvotes for this meme
        totalVotes: {$sum: "$votes.value"},
        // An average of all edge ratings for this meme
        avgEdgevotes: {$avg: "$edgevotes.value"},
        // Take the best description and provide it for search
        description: {$ifNull: [
          {$arrayElemAt: [{$map: {
            input: "$descriptions", in: {$cond: [{$eq: ["$$this.votes.value", {$max: "$descriptions.votes.value"}]}, "$$this.description", null]}
          }},0]},
          null
        ]},
        // Take the best transcription and provide it for search
        transcription: {$ifNull: [
          {$arrayElemAt: [{$map:{
            input: "$transcriptions", in: {$cond: [{$eq: ["$$this.votes.value", {$max: "$transcriptions.votes.value"}]}, "$$this.transcription", null]}
          }},0]},
          null
        ]},
        // Take tags that are upvoted more than downvoted and include them in metadata
        topTags: {$ifNull: [{$map: {input: {$filter: {
            input: "$tags", as: "tag", cond: {$gt: [{$sum: "$$tag.votes.value"}, 0]}
          }}, as: "tag", in: "$$tag.tagId"
        }}, []]},
        // Take categories that are upvoted more than downvoted and include them in metadata
        topCategories: {$ifNull: [{$map: {input: {$filter: {
            input: "$categories", as: "category", cond: {$gt: [{$sum: "$$category.votes.value"}, 0]}
          }}, as: "category", in: "$$category.categoryId"
        }}, []]}
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
        avgEdgevotes: { $lte: Number(edge)+0.5 },
        "flags.hidden": false,
        // Tag filtering
        ...(tags=='all' ? {}: (inclusivetags.length ? {topTags: {$in: inclusivetags}} : {topTags: {$nin: exclusivetags}})),
        // Category filtering
        ...(categories=='all' ? {} : (inclusivecats.length ? {topCategories: {$in: inclusivecats}} : {topCategories: {$nin: exclusivecats}})),
      }
    },
    {
      // Use the provided ruleset for sorting memes
      $sort: sortMode[sort]
    },
    {
      $facet: {
        // Include a result count for pagination
        stats: [{$count: 'matches'}],
        // Pagination with a hardcoded 50 meme limit
        memes: [{$skip: Number(from)}, {$limit: 50}]
      }
    }
  ];
  return (await db.collection("meme").aggregate(pipeline).toArray())[0];
}