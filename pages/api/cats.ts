import { Db } from "mongodb";
import clientPromise from "../../lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  if(req.method != 'GET')
    return res.status(405);
  const client = await clientPromise;
  const db = client.db("memedb");
  const cats = await getCats(db);
  res.json(cats);
}

export async function getCats(db:Db) {
  return await db.collection("category").find({}).toArray();
}