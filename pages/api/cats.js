import { fetch } from "../../modules/DB";

export async function getcats(callback) {
  return fetch(`SELECT * from category`, callback);
}

export default async (req, res) => {
  return new Promise((resolve, reject) => {
    getcats((err, results, fields) => {
      if(err){
        res.status(500);
        resolve();
      }
      else{
        res.status(200).json(results);
        resolve();
      }
    })
  });
};