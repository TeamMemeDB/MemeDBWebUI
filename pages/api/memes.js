import clientPromise from "../../lib/mongodb";

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
      res.json(result || {matches: 0});
      break;
  }
}

export async function getMemes(db, query={}) {
  const {sort = 'new', categories = 'all', tags = 'all', edge = 0, from = 0, filter=''} = query;

  if(edge > 1) {
    return {matches: 0, errorMessage: "Authorization is required to view these memes."};
  }

  // Sort through tag ids, if they start with a minus, exclude them from results
  const inclusivetags = [];
  const exclusivetags = [];
  if(tags!='all') {
    tags.split(',').forEach(tag => {
      if(tag.charAt(0) == '-') exclusivetags.push(tag.substring(1));
      else inclusivetags.push(tag);
    });
  }
  // The same with categories
  const inclusivecats = [];
  const exclusivecats = [];
  if(categories!='all'){
    categories.split(',').forEach(category => {
      if(category.charAt(0) == '-') exclusivecats.push(category.substring(1));
      else inclusivecats.push(category);
    });
  }

  // The actual query sent to MongoDB
  const pipeline = [
    {
      $match: {
        // Hide unrated memes
        ...(edge < 5? {edgevotes: {$exists: true}}: {})
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
        descriptionAuthor: {$ifNull: [
          {$arrayElemAt: [{$map: {
            input: "$descriptions", in: {$cond: [{$eq: ["$$this.votes.value", {$max: "$descriptions.votes.value"}]}, "$$this.author", null]}
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
        transcriptionAuthor: {$ifNull: [
          {$arrayElemAt: [{$map:{
            input: "$transcriptions", in: {$cond: [{$eq: ["$$this.votes.value", {$max: "$transcriptions.votes.value"}]}, "$$this.author", null]}
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
    // Find the authors of the description and transcription
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
        ...(edge < 5? {avgEdgevotes: {$gte: Number(edge)-0.5, $lt: Number(edge)+0.5 }} : {edgevotes: {$eq: []}}),
        "flags.hidden": false,
        // Tag filtering
        ...(tags=='all' ? {}: (inclusivetags.length ? {topTags: {$in: inclusivetags}} : {topTags: {$nin: exclusivetags}})),
        // Category filtering
        ...(categories=='all' ? {} : (inclusivecats.length ? {topCategories: {$in: inclusivecats}} : {topCategories: {$nin: exclusivecats}})),
        // Text search
        ...(filter? {$or: [
          { description: { $regex: filter, $options: 'i' } },
          { transcription: { $regex: filter, $options: 'i' } },
        ]}: {})
      }
    },
    {
      // Use the provided ruleset for sorting memes
      $sort: sortMode[sort]
    },
    {
      $group: {
        _id: null,
        // Include a result count for pagination
        matches: {$sum: 1},
        // Pagination with a hardcoded 50 meme limit
        memes: {$push: "$$ROOT"}
      }
    },
    {
      $project: {
        _id: 0,
        matches: 1,
        memes: {$slice: ["$memes", Number(from), 50]}
      }
    }
  ];
  return (await db.collection("meme").aggregate(pipeline).toArray())[0];
}