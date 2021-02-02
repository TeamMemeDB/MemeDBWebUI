// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { db } from "../../modules/DB";

export default async(req, res) => {
  return new Promise((resolve, reject) => {
    db.getConnection((err, conn) => {
      if(err){
        res.status(500).json({status:'down', err:err});
        resolve();
      }else{
        conn.query(`SELECT COUNT(Id) as count FROM meme`, (err, results, fields) => {
          if(err){
            res.status(500).json({status:'down', err:err});
            resolve();
          }
          res.status(200).json({status:'up', memes:results[0]['count']});
          resolve();
        });
      }
    })
  });
}