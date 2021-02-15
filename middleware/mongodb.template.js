// Enter a mongodb connection url below and rename this file to mongodb.js
const dburl = "{DB-URL-HERE}";

import { MongoClient } from 'mongodb';
import nextConnect from 'next-connect';


const client = new MongoClient(dburl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function database(req, res, next) {
  if (!client.isConnected()) await client.connect();
  req.dbClient = client;
  req.db = client.db('MCT');
  return next();
}

const middleware = nextConnect();
middleware.use(database);
export default middleware;