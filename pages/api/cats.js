import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("memedb");
  switch (req.method) {
    case "GET":
      const cats = await getCats(db);
      res.json(cats);
      break;
  }
}

export async function getCats(db) {
  return await db.collection("category").find({}).toArray();
}