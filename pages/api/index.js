import nextConnect from 'next-connect';
import middleware from '../../middleware/mongodb';

const handler = nextConnect();
handler.use(middleware);

handler.get(async (req, res) => {
  try {
    var result = await req.db.collection('meme').estimatedDocumentCount();
    res.status(200).json({status:'up', count:result});
  }
  catch {
    res.status(500).json({status:'down'});
  }
  req.dbClient.close();
});

export default handler;