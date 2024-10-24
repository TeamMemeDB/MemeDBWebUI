import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  if(req.method != 'GET')
    return res.status(405);
  const client = await clientPromise;
  const db = client.db("memedb");
  try {
    const count = await db.collection("meme").estimatedDocumentCount();
    res.json({status:'up', count:count});
  } catch {
    res.json({status:'down'});
  }
}
