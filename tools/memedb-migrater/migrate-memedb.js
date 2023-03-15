import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({'path': '/home/yiays/memebeta/.env.local'});

import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}

let client
let clientPromise

if (!process.env.MONGODB_URI) {
  throw new Error('Add Mongo URI to .env.local')
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

const config = {
  clean: true,
  category: true,
  tag: true,
  user: true,
  meme: true,
  favourites: true
};

let rawdata = fs.readFileSync("memedb-export.json");
const data = JSON.parse(rawdata);

function findtable(name) {
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

    if(config.category) {
      console.log("Migrating categories...");
      if(config.clean){
        console.log("Clearing table first...\nDeleted "+(await db.collection('category').deleteMany({})).deletedCount+" rows.");
      }
      
      let dbobj = findtable('category');

      let rows = [];
      dbobj.data.forEach(row => {
        rows.push({
          id: parseInt(row.Id),
          name: row.Name,
          description: row.Description,
          memes: 0
        });
      });
      
      await db.collection('category').insertMany(rows);
    }
    if(config.tag) {
      console.log("\nMigrating tags...");
      if(config.clean){
        console.log("Clearing table first...\nDeleted "+(await db.collection('tag').deleteMany({})).deletedCount+" rows.");
      }

      let dbobj = findtable('tag');

      let rows = [];
      dbobj.data.forEach(row => {
        rows.push({
          id: parseInt(row.Id),
          name: row.Name,
          memes: 0
        });
      });
      
      await db.collection('tag').insertMany(rows);
    }
    if(config.user) {
      console.log("\nMigrating users...");
      if(config.clean){
        console.log("Clearing table first...\nDeleted "+(await db.collection('user').deleteMany({})).deletedCount+" rows.");
      }

      let dbobj = findtable('user');

      let rows = [];
      dbobj.data.forEach(row => {
        rows.push({
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

      await db.collection('user').insertMany(rows);
    }
    if(config.meme) {
      console.log("\nMigrating memes...");
      if(config.clean){
        console.log("Clearing table first...\nDeleted "+(await db.collection('meme').deleteMany({})).deletedCount+" rows.");
      }

      // Create neoId converters
      let userConverter = {};
      var cursor = db.collection('user').find({});
      await cursor.forEach(user => {userConverter[user.discordId] = user._id});

      let catConverter = {};
      var cursor = db.collection('category').find({});
      await cursor.forEach(cat => {catConverter[cat.id] = cat._id});

      let tagConverter = {};
      var cursor = db.collection('tag').find({});
      await cursor.forEach(tag => {tagConverter[tag.id] = tag._id});

      // Create vote counters for all transcriptions, descriptions, and edge ratings
      let dbtransvote = findtable('transvote').data;
      let transdata = {};
      dbtransvote.forEach(transvote => {
        let data = {user: userConverter[transvote.userId], value: parseInt(transvote.Value)};

        if(transdata[transvote.transId] === undefined){
          transdata[transvote.transId] = [data];
        }else{
          transdata[transvote.transId].push(data)
        }
      });
      
      let dbdescvote = findtable('descvote').data;
      let descdata = {};
      dbdescvote.forEach(descvote => {
        let data = {user: userConverter[descvote.userId], value: parseInt(descvote.Value)};
        
        if(descdata[descvote.descId] === undefined){
          descdata[descvote.descId] = [data];
        }else{
          descdata[descvote.descId].push(data)
        }
      });

      let dbedgevote = findtable('edge').data;
      let edgedata = {};
      dbedgevote.forEach(edgevote => {
        let data = {user: userConverter[edgevote.userId], value: parseInt(edgevote.Rating)};

        if(edgedata[edgevote.memeId] === undefined){
          edgedata[edgevote.memeId] = [data];
        }else{
          edgedata[edgevote.memeId].push(data);
        }
      })

      // Generate list of meme objects
      let dbmemes = findtable('meme').data;

      let rows = [];
      dbmemes.forEach(meme => {
        // Generate list of memevote objects
        let dbvotes = findtable('memevote').data;
        let memevotes = [];
        dbvotes.forEach(vote => {
          if(vote.memeId == meme.Id){
            memevotes.push({
              user: userConverter[vote.userId],
              value: parseInt(vote.Value)
            });
          }
        });

        // Generate list of categoryvote objects
        let dbcats = findtable('categoryvote').data;
        let catdata = {};
        dbcats.forEach(cat => {
          if(cat.memeId == meme.Id){
            if(catdata[cat.categoryId] === undefined) catdata[cat.categoryId] = [];
            catdata[cat.categoryId].push({user: userConverter[cat.userId], value: parseInt(cat.Value)});
          }
        });
        let memecategories = [];
        for(let [catid, catvotes] of Object.entries(catdata)) {
          memecategories.push({
            category: catConverter[catid],
            votes: catvotes
          });
        }

        // Generate list of tagvote objects
        let dbtags = findtable('tagvote').data;
        let tagdata = {};
        dbtags.forEach(tag => {
          if(tag.memeId == meme.Id){
            if(tagdata[tag.tagId] === undefined) tagdata[tag.tagId] = [];
            tagdata[tag.tagId].push({user: userConverter[tag.userId], value: parseInt(tag.Value)});
          }
        });
        let tags = [];
        for(let [tagid, tagvotes] of Object.entries(tagdata)) {
          tags.push({
            tag: tagConverter[tagid],
            votes: tagvotes
          });
        }

        // Generate list of transcription objects
        let dbtrans = findtable('transcription').data;
        let transcriptions = [];
        dbtrans.forEach(transcription => {
          if(transcription.memeId == meme.Id){
            transcriptions.push({
              id: parseInt(transcription.Id),
              transcription: transcription.Text,
              author: userConverter[transcription.userId],
              edit: (transcription.editId === null)? null: parseInt(transcription.editId),
              votes: transdata[transcription.Id]
            });
          }
        });

        // Generate list of description objects
        let dbdesc = findtable('description').data;
        let descriptions = [];
        dbdesc.forEach(description => {
          if(description.memeId == meme.Id){
            descriptions.push({
              id: parseInt(description.Id),
              description: description.Text,
              author: userConverter[description.userId],
              edit: (description.editId === null)? null: parseInt(description.editId),
              votes: descdata[description.Id]
            });
          }
        });


        if(meme.CollectionParent === null){
          rows.push({
            id: parseInt(meme.Id),
            discordOrigin: meme.DiscordOrigin,
            type: (meme.Type == 'webm')? 'video': meme.Type,
            url: meme.Url,
            thumbUrl: `https://cdn.yiays.com/meme/${meme.Hash}.thumb.jpg`,
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
            tags: tags,
            descriptions: descriptions,
            transcriptions: transcriptions,
            edgevotes: edgedata[meme.Id],
            flags: {
              hidden: (meme.Hidden)? true: false,
              nsfw: (meme.Nsfw)? true: false,
              silent: (meme.Type == 'video')? true: (meme.Type == 'webm')? false: null
            }
          });
        }else{
          let found = false;
          for(let rowid in rows){
            let row = rows[rowid];
            if(parseInt(meme.CollectionParent) == row.id){
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
    if(config.favourites) {
      console.log("\nMigrating favourites...");
      if(config.clean) console.log("Existing favourites will be erased.");

      // Create neoId converters
      let userConverter = {};
      let userFavourites = {};
      var cursor = db.collection('user').find({});
      await cursor.forEach(user => {
        userConverter[user.discordId] = user._id;
        if(config.clean) userFavourites[user.discordId] = { name: "favourites", public: user.lists[0].public, memes: [] };
        else userFavourites[user.discordId] = user.lists[0];
      });

      let memeConverter = {};
      var cursor = db.collection('meme').find({});
      await cursor.forEach(meme => {
        memeConverter[meme.id] = meme._id;
      });

      let dbfavourites = findtable('favourites').data;
      dbfavourites.forEach(favourite => {
        userFavourites[favourite.userId].memes.push({
          meme: memeConverter[favourite.memeId],
          dateAdded: Date.parse(favourite.dateAdded)
        });
      });

      for(let [discordId, favourites] of Object.entries(userFavourites)){
        await db.collection('user').updateOne({_id: userConverter[discordId]}, {$set: {"lists.0": favourites}});
      }
    }

    console.log("\nDone!");
  }
  finally {
    await client.close();
  }
}

main().catch(console.dir);