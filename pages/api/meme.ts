import clientPromise from "@/lib/mongodb";
import { Db } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  if(req.method != 'GET')
    return res.status(405);
  const client = await clientPromise;
  const db = client.db("memedb");
  let result: object | false = false;
  if(typeof req.query.id == 'string')
    result = await getMeme(db, Number(req.query.id), Number(req.query.edge||0));
  else
    result = false;
  res.json(result || {errorMessage: 'Meme not found'});
}

export async function getMeme(db:Db, id:number, maxEdge:number): Promise<object|false> {
  if(maxEdge > 1) {
    return {errorMessage: "Authorization is required to view these memes."};
  }

  // The actual query sent to MongoDB
  const pipeline = [
    {
      $match: {
        // Hide unrated memes
        ...(maxEdge < 5? {edgevotes: {$exists: true}}: {}),
        _id: id
      }
    },
    {
      $addFields: {
        // An average of all edge ratings for this meme
        avgEdgevotes: {$avg: "$edgevotes.value"},
      }
    },
    {
      // Exclude irrelevant data to decrease data usage and latency
      // urls and originalUrls are excluded to help reduce vulnerability to scraping
      $unset: ['downloader', 'discordOrigin', 'originalUrl', 'originalUrls']
    },
    {
      $match: {
        // Takes edge ratings by majority rule, favouring caution
        ...(maxEdge < 5? {avgEdgevotes: {$lt: Number(maxEdge)+0.5 }} : {}),
        "flags.hidden": false
      }
    }
  ];
  const result = await db.collection("meme").aggregate(pipeline).toArray();
  if(result) return result[0];
  return false;
}