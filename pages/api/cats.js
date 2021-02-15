import nextConnect from 'next-connect';
import middleware from '../../middleware/mongodb';

const handler = nextConnect();
handler.use(middleware);

handler.get(async (req, res) => {
  try{
    const results = await req.db.collection('category').find({}).toArray((err, row)=>{if(err) throw err;req.dbClient.close();});
    res.status(200).json(results);
  }
  catch{
    res.status(500);
  }
});

export default handler;