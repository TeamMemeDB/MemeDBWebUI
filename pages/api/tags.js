import { fetch } from "../../modules/DB";

export async function gettags(callback) {
  return fetch(`SELECT tag.*,IFNULL(COUNT(memeId),0) AS Votes
                FROM tag
                LEFT JOIN tagvote ON tag.Id = tagvote.tagId
                GROUP BY Id
                ORDER BY Votes DESC`, callback);
}

export default async (req, res) => {
  return new Promise((resolve, reject) => {
    gettags((err, results, fields) => {
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