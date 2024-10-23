import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({'path': '/home/yiays/memebeta/.env.local'});

import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI;
if(typeof uri == 'undefined') throw Error("MONGODB_URI must be provided in env.local");

const client = new MongoClient(uri, {});
const clientPromise = client.connect();

const config = {
  clean: true,
  category: true,
  tag: true,
  user: true,
  meme: true,
  favourites: true
};

let rawdata = fs.readFileSync("memedb-export.json");
const data = JSON.parse(String(rawdata));

function get_table(name:string):any[] {
  for(let index in data){
    if(data[index].type == "table" && data[index].name == name) return data[index];
  }
  throw new Error(`Failed to find ${name} table!`);
}

async function main() {
  try {
    await clientPromise;

    // Verify connection
    await client.db("admin").command({ ping: 1 });
    console.log("Connected successfully to MongoDB");

    let db = client.db('memedb');

    let userConverter = {};
    let categoryCounter = {};
    let tagCounter = {};

    if(config.user) {
      console.log("\nMigrating users...");
      if(config.clean){
        console.log("Clearing table first...\nDeleted "+(await db.collection('user').deleteMany({})).deletedCount+" rows.");
      }

      let db_user = get_table('user')['data'];
      let userrows:object[] = [];
      let i = 0;
      db_user.forEach(row => {
        userConverter[row.Id] = i++;
        userrows.push({
          _id: userConverter[row.Id],
          discordId: row.Id,
          username: (row.Discriminator !== null)?row.Username+'#'+row.Discriminator : row.Username,
          avatar: (row.Avatar === "")?`https://cdn.discordapp.com/avatars/"${parseInt(row.Discriminator)%5}.png`:(row.Avatar !== null)?`https://cdn.discordapp.com/avatars/${row.Id}/${row.Avatar}.jpg`:null,
          admin: row.Admin=='1'?true:false,
          banned: row.Banned=='1'?true:false,
          points: parseInt(row.Points),
          messages: [],
          lists: [
            {
              name: "favourites",
              public: row.FavouritesPrivacy=='1'?true:false,
              memes: []
            }
          ]
        });
      });

      if(config.favourites) {
        console.log("\nMigrating favourites as a part of user migration...")
        let db_favourites = get_table('favourites')['data'];
        db_favourites.forEach(fav => {
          if(fav.userId in userConverter) {
            userrows[userConverter[fav.userId]]['lists'][0].memes.push({
              memeId: fav.memeId,
              dateAdded: new Date(fav.dateAdded)
            });
          }else{
            console.warn("\nUnable to find user "+fav.userId);
          }
        });
      }

      await db.collection('user').insertMany(userrows);
    }
    if(config.meme) {
      console.log("\nMigrating memes...");
      if(config.clean){
        console.log("Clearing table first...\nDeleted "+(await db.collection('meme').deleteMany({})).deletedCount+" rows.");
      }

      // Create vote counters for all transcriptions, descriptions, and edge ratings
      let db_transvote = get_table('transvote')['data'];
      let transdata = {};
      db_transvote.forEach(transvote => {
        let data = {user: userConverter[transvote.userId], value: parseInt(transvote.Value)};

        if(transdata[transvote.transId] === undefined){
          transdata[transvote.transId] = [data];
        }else{
          transdata[transvote.transId].push(data)
        }
      });
      
      let db_descvote = get_table('descvote')['data'];
      let descdata = {};
      db_descvote.forEach(descvote => {
        let data = {user: userConverter[descvote.userId], value: parseInt(descvote.Value)};
        
        if(descdata[descvote.descId] === undefined){
          descdata[descvote.descId] = [data];
        }else{
          descdata[descvote.descId].push(data)
        }
      });

      let db_edgevote = get_table('edge')['data'];
      let edgedata = {};
      db_edgevote.forEach(edgevote => {
        let data = {user: userConverter[edgevote.userId], value: parseInt(edgevote.Rating)};

        if(edgedata[edgevote.memeId] === undefined){
          edgedata[edgevote.memeId] = [data];
        }else{
          edgedata[edgevote.memeId].push(data);
        }
      })

      // Generate list of meme objects
      let db_memes = get_table('meme')['data'];

      let rows:any[] = [];
      db_memes.forEach(meme => {
        // Generate list of memevote objects
        let dbvotes = get_table('memevote')['data'];
        let memevotes:object[] = [];
        dbvotes.forEach(vote => {
          if(vote.memeId == meme.Id){
            memevotes.push({
              user: userConverter[vote.userId],
              value: parseInt(vote.Value)
            });
          }
        });

        // Generate list of categoryvote objects
        let db_cats = get_table('categoryvote')['data'];
        let catdata = {};
        db_cats.forEach(cat => {
          if(cat.memeId == meme.Id){
            categoryCounter[cat.categoryId] = (categoryCounter[cat.categoryId] || 0) + 1;
            if(catdata[cat.categoryId] === undefined) catdata[cat.categoryId] = [];
            catdata[cat.categoryId].push({user: userConverter[cat.userId], value: parseInt(cat.Value)});
          }
        });
        let memecategories:object[] = [];
        for(let [catid, catvotes] of Object.entries(catdata)) {
          memecategories.push({
            category: parseInt(catid),
            votes: catvotes
          });
        }

        // Generate list of tagvote objects
        let db_tags = get_table('tagvote')['data'];
        let tagdata = {};
        db_tags.forEach(tag => {
          if(tag.memeId == meme.Id){
            tagCounter[tag.tagId] = (tagCounter[tag.tagId] || 0) + 1;
            if(tagdata[tag.tagId] === undefined) tagdata[tag.tagId] = [];
            tagdata[tag.tagId].push({user: userConverter[tag.userId], value: parseInt(tag.Value)});
          }
        });
        let memetags:object[] = [];
        for(let [tagid, tagvotes] of Object.entries(tagdata)) {
          memetags.push({
            tag: parseInt(tagid),
            votes: tagvotes
          });
        }

        // Generate list of transcription objects
        let db_trans = get_table('transcription')['data'];
        let transcriptions:object[] = [];
        db_trans.forEach(transcription => {
          if(transcription.memeId == meme.Id){
            transcriptions.push({
              _id: parseInt(transcription.Id),
              transcription: transcription.Text,
              author: userConverter[transcription.userId],
              edit: (transcription.editId === null)? null: parseInt(transcription.editId),
              votes: transdata[transcription.Id]
            });
          }
        });

        // Generate list of description objects
        let db_desc = get_table('description'['data']);
        let descriptions:object[] = [];
        db_desc.forEach(description => {
          if(description['memeId'] == meme.Id){
            descriptions.push({
              _id: parseInt(description.Id),
              description: description.Text,
              author: userConverter[description.userId],
              edit: (description.editId === null)? null: parseInt(description.editId),
              votes: descdata[description.Id]
            });
          }
        });


        if(meme.CollectionParent === null){
          rows.push({
            _id: parseInt(meme.Id),
            discordOrigin: meme.DiscordOrigin,
            type: (meme.Type == 'webm')? 'video': meme.Type,
            url: meme.Url,
            thumbUrl: `https://cdn.yiays.com/meme/${meme.Id}x${meme.Hash}.thumb.jpg`,
            originalUrl: meme.OriginalUrl,
            color: meme.Color,
            width: meme.Width,
            height: meme.Height,
            uploadDate: Date.parse(meme.Date),
            downloader: {
              hash: meme.Hash,
              downloadable: (meme.Downloadable)? true: false
            },
            votes: memevotes,
            categories: memecategories,
            tags: memetags,
            descriptions: descriptions,
            transcriptions: transcriptions,
            edgevotes: edgedata[meme.Id],
            flags: {
              hidden: (meme.Hidden == '1')? true: false,
              nsfw: (meme.Nsfw == '1')? true: false,
              silent: (meme.Type == 'video')? true: (meme.Type == 'webm')? false: null
            }
          });
        }else{
          let found = false;
          for(let rowid in rows){
            let row = rows[rowid];
            if(parseInt(meme.CollectionParent) == row._id){
              if(row.url){
                row.urls = [row.url, meme.Url];
                delete row.url;
                row.originalUrls = [row.originalUrl, meme.OriginalUrl];
                delete row.originalUrl;
              }else{
                row.urls.push(meme.Url);
                row.originalUrls.push(meme.OriginalUrl);
              }
              found = true;
              break;
            }
          }

          if(!found) {
            throw new Error(`Failed to find collectionParent (${meme.CollectionParent})!`);
          }
        }
      });
      
      await db.collection('meme').insertMany(rows);
    }
    
    if(config.category) {
      console.log("\nMigrating categories...");
      if(config.clean){
        console.log("Clearing table first...\nDeleted "+(await db.collection('category').deleteMany({})).deletedCount+" rows.");
      }
      
      let db_cats = get_table('category');

      let rows:object[] = [];
      db_cats['data'].forEach(row => {
        rows.push({
          _id: parseInt(row.Id),
          name: row.Name,
          description: row.Description,
          memes: categoryCounter[parseInt(row.Id)] || 0
        });
      });
      
      await db.collection('category').insertMany(rows);
    }
    if(config.tag) {
      console.log("\nMigrating tags...");
      if(config.clean){
        console.log("Clearing table first...\nDeleted "+(await db.collection('tag').deleteMany({})).deletedCount+" rows.");
      }

      let db_tags = get_table('tag');

      let rows:object[] = [];
      db_tags['data'].forEach(row => {
        rows.push({
          _id: parseInt(row.Id),
          name: row.Name,
          memes: tagCounter[parseInt(row.Id)] || 0
        });
      });
      
      await db.collection('tag').insertMany(rows);
    }

    console.log("\nDone!");
  }
  finally {
    await client.close();
  }
}

main().catch(console.dir);