import { Db } from "mongodb";
import clientPromise from "../../lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  if(req.method != 'GET')
    return res.status(405);
  const client = await clientPromise;
  const db = client.db("memedb");
  const tags = await getTags(db);
  res.json(tags);
}

export async function getTags(db:Db) {
  return await db.collection("tag").find({}).toArray();
}