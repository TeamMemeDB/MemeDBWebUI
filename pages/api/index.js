// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { fetch } from "../../modules/DB";

export default async (req, res) => {
  return fetch(`SELECT COUNT(Id) FROM meme`, (err, results=null, fields=null) => {
    if(err){
      res.status(500).json({status:'down', err:err});
    }else{
      res.status(200).json({status:'up', memes:results[0]['COUNT(Id)']});
    }
  });
}