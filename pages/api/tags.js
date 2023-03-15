import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("memedb");
  switch (req.method) {
    case "GET":
      const tags = await db.collection("tag").find({}).toArray();
      res.json(tags);
      break;
  }
}
