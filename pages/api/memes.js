import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("memedb");
  switch (req.method) {
    case "GET":
      const memes = await db.collection("meme").find({}).toArray();
      res.json(memes);
      break;
  }
}
