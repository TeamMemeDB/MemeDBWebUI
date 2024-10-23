import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI

if (typeof uri !== 'string') {
  throw new Error('Add Mongo URI to .env.local');
}

const client = new MongoClient(uri, {});
const clientPromise = client.connect();

export default clientPromise
