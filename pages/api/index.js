import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("memedb");
  switch (req.method) {
    case "GET":
      try {
        const count = await db.collection("meme").estimatedDocumentCount();
        res.status(200).json({status:'up', count:count});
      } catch {
        res.status(200).json({status:'down'});
      }
      break;
  }
}
