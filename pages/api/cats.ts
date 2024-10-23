import clientPromise from "../../lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("memedb");
  const cats = await getCats(db);
  return Response.json(cats);
}

export async function getCats(db) {
  return await db.collection("category").find({}).toArray();
}