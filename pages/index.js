import Head from 'next/head';
import clientPromise from '../lib/mongodb';
import {Browse} from '../modules/Layout';
//import { getcats } from './api/cats';
//import { gettags } from './api/tags';

export async function getStaticProps() {
  var props = {categories: [], tags: [], memes: []};
  const dbClient = await clientPromise;
  const db = await dbClient.db('memedb');

  /*const memes = await db.collection('meme').find({}).toArray();
  memes.forEach(meme => {
    props.memes.push({
      id: meme.id,
      type: meme.type,
      url: meme.url,
      thumbUrl: meme.thumbUrl,
      color: meme.color,
      width: meme.width,
      height: meme.height,
      date: meme.uploadDate,
      votes: meme.votes,
      hidden: meme.flags.hidden,
      
    })
  });*/

  const cats = await db.collection('category').find({}).toArray();
  cats.forEach(cat => {
    props.categories.push({
      id: cat.id,
      name:cat.name.toLowerCase(),
      displayname:cat.name,
      counter: 0,
      href:'/category/'+encodeURIComponent(cat.name.toLowerCase())+'/'+cat.id,
      description: cat.description
    });
  });
  
  const tags = await db.collection('tag').find({}).toArray();
  tags.forEach(tag => {
    props.tags.push({
      id: tag.id,
      name: tag.name.toLowerCase(),
      displayname: '#'+tag.name,
      counter: 0,
      href: '/tag/'+encodeURIComponent(tag.name.toLowerCase())+'/'+tag.id,
      hidden: false
    });
  });

  return { props: props };
}

export default function Home(props) {
  return <>
    <Head>
      <title>What is MemeDB?</title>
      <meta name="author" content="Yiays"/>
      <meta name="og:title" content="MemeDB Browser"/>
      <meta name="description" content="MemeDB is a massive database of memes. Memes are indexed and metadata is crowd-sourced and so that any meme you are thinking of should be searchable!"/>
      <meta name="og:description" content="MemeDB is a massive database of memes. Memes are indexed and metadata is crowd-sourced and so that any meme you are thinking of should be searchable!"/>
      <meta name="keywords" content="meme,memes,image,images,video,videos,gifs,webms,hashtag,search,database,index,meme,memes,database,search,find"/>
    </Head>
    <Browse categories={props.categories} tags={props.tags}/>
  </>;
}
