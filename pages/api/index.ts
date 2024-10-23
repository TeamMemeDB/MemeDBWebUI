import clientPromise from "../../lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("memedb");
  try {
    const count = await db.collection("meme").estimatedDocumentCount();
    return Response.json({status:'up', count:count});
  } catch {
    return Response.json({status:'down'});
  }
}
