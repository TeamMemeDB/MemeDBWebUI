// Copy and rename to DB.js with real data

import mysql from 'mysql';
export const db = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'meme',
  password: "password",
  database: 'meme',
  charset: 'utf8mb4'
});

export function fetch(query, callback) {
  return new Promise((resolve, reject) => {
    db.getConnection((err, conn) => {
      if(err){
        callback(err);
        resolve();
      }else{
        conn.query(query, (err, results, fields) => {
          callback(err, results, fields);
          resolve();
        });
      }
    })
  });
}