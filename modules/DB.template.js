// Copy and rename to DB.js with real data

import mysql from 'mysql';
export const db = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'meme',
  password: "password",
  database: 'meme'
});