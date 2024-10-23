import clientPromise from "../../lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("memedb");
  const tags = await getTags(db);
  return Response.json(tags);
}

export async function getTags(db) {
  return await db.collection("tag").find({}).toArray();
}