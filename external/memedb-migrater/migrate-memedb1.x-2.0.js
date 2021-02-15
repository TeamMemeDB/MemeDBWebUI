const { MongoClient } = require('mongodb');
const config = {
  clean: true,
  category: false,
  tag: false,
  user: false,
  meme: false,
  favourites: true
};
const dburl = "mongodb+srv://memedb:RvhGDJwl1llaZ9C5@merelyservices.saaan.mongodb.net/memedb?retryWrites=true&w=majority";
const client = new MongoClient(dburl);

const fs = require('fs');
var rawdata = fs.readFileSync("memedb-export-v1.0.json");
const data = JSON.parse(rawdata);

async function main() {
  try {
    await client.connect();

    // Verify connection
    await client.db("admin").command({ ping: 1 });
    console.log("Connected successfully to MongoDB");

    var db = client.db('memedb');

    if(config.category) {
      console.log("Migrating categories...");
      if(config.clean){
        console.log("Clearing table first...\nDeleted "+(await db.collection('category').deleteMany({})).deletedCount+" rows.");
      }
      
      var dbobj = findtable('category');

      var rows = [];
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

      var dbobj = findtable('tag');

      var rows = [];
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

      var dbobj = findtable('user');

      var rows = [];
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
      var userConverter = {};
      var cursor = db.collection('user').find({});
      await cursor.forEach(user => {userConverter[user.discordId] = user._id});

      var catConverter = {};
      var cursor = db.collection('category').find({});
      await cursor.forEach(cat => {catConverter[cat.id] = cat._id});

      var tagConverter = {};
      var cursor = db.collection('tag').find({});
      await cursor.forEach(tag => {tagConverter[tag.id] = tag._id});

      // Create vote counters for all transcriptions and descriptions
      var dbtransvote = findtable('transvote').data;
      var transdata = {};
      dbtransvote.forEach(transvote => {
        var data = {user: userConverter[transvote.userId], value: parseInt(transvote.Value)};

        if(transdata[transvote.transId] === undefined){
          transdata[transvote.transId] = [data];
        }else{
          transdata[transvote.transId].push(data)
        }
      });
      
      var dbdescvote = findtable('descvote').data;
      var descdata = {};
      dbdescvote.forEach(descvote => {
        var data = {user: userConverter[descvote.userId], value: parseInt(descvote.Value)};
        
        if(descdata[descvote.descId] === undefined){
          descdata[descvote.descId] = [data];
        }else{
          descdata[descvote.descId].push(data)
        }
      });

      // Generate list of meme objects
      var dbmemes = findtable('meme').data;

      var rows = [];
      dbmemes.forEach(meme => {
        // Generate list of memevote objects
        var dbvotes = findtable('memevote').data;
        var votes = [];
        dbvotes.forEach(vote => {
          if(vote.memeId == meme.Id){
            votes.push({
              user: userConverter[vote.userId],
              value: parseInt(vote.Value)
            });
          }
        });

        // Generate list of categoryvote objects
        var dbcats = findtable('categoryvote').data;
        var catdata = {};
        dbcats.forEach(cat => {
          if(cat.memeId == meme.Id){
            if(catdata[cat.categoryId] === undefined) catdata[cat.categoryId] = [];
            catdata[cat.categoryId].push({user: userConverter[cat.userId], value: parseInt(cat.Value)});
          }
        });
        var categories = [];
        for(var [catid, catvotes] of Object.entries(catdata)) {
          categories.push({
            category: catConverter[catid],
            votes: catvotes
          });
        }

        // Generate list of tagvote objects
        var dbtags = findtable('tagvote').data;
        var tagdata = {};
        dbtags.forEach(tag => {
          if(tag.memeId == meme.Id){
            if(tagdata[tag.tagId] === undefined) tagdata[tag.tagId] = [];
            tagdata[tag.tagId].push({user: userConverter[tag.userId], value: parseInt(tag.Value)});
          }
        });
        var tags = [];
        for(var [tagid, tagvotes] of Object.entries(tagdata)) {
          tags.push({
            tag: tagConverter[tagid],
            votes: tagvotes
          });
        }

        // Generate list of transcription objects
        var dbtrans = findtable('transcription').data;
        transcriptions = [];
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
        var dbdesc = findtable('description').data;
        descriptions = [];
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
            votes: votes,
            categories: categories,
            tags: tags,
            descriptions: descriptions,
            transcriptions: transcriptions,
            flags: {
              hidden: (meme.Hidden)? true: false,
              nsfw: (meme.Nsfw)? true: false,
              silent: (meme.Type == 'video')? true: (meme.Type == 'webm')? false: null
            }
          });
        }else{
          var found = false;
          for(rowid in rows){
            var row = rows[rowid];
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
      var userConverter = {};
      var userFavourites = {};
      var cursor = db.collection('user').find({});
      await cursor.forEach(user => {
        userConverter[user.discordId] = user._id;
        if(config.clean) userFavourites[user.discordId] = { name: "favourites", public: user.lists[0].public, memes: [] };
        else userFavourites[user.discordId] = user.lists[0];
      });

      var memeConverter = {};
      var cursor = db.collection('meme').find({});
      await cursor.forEach(meme => {
        memeConverter[meme.id] = meme._id;
      });

      var dbfavourites = findtable('favourites').data;
      dbfavourites.forEach(favourite => {
        userFavourites[favourite.userId].memes.push({
          meme: memeConverter[favourite.memeId],
          dateAdded: Date.parse(favourite.dateAdded)
        });
      });

      for(var [discordId, favourites] of Object.entries(userFavourites)){
        await db.collection('user').updateOne({_id: userConverter[discordId]}, {$set: {"lists.0": favourites}});
      }
    }

    console.log("\nDone!");
  }
  finally {
    await client.close();
  }
}

function findtable(name) {
  for(index in data){
    if(data[index].type == "table" && data[index].name == name) return data[index];
  }
  throw new Error(`Failed to find ${name} table!`);
}

main().catch(console.dir);