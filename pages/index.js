import Head from 'next/head';
import clientPromise from '../lib/mongodb';
import {Browse} from '../modules/Layout';
import { getCats } from './api/cats';
import { getTags } from './api/tags';
import { getMemes } from './api/memes';

export async function getStaticProps() {
  let props = {categories: [], tags: [], memes: []};
  const dbClient = await clientPromise;
  const db = await dbClient.db('memedb');

  props.memes = await getMemes(db);
  props.tags = await getTags(db);
  props.categories = await getCats(db);

  return { props: props };
}

export default function Home(props) {
  return <>
    <Head>
      <title>MemeDB</title>
      <meta name="author" content="Yiays"/>
      <meta name="og:title" content="MemeDB Browser"/>
      <meta name="description" content="MemeDB is a massive database of memes. Memes are indexed and metadata is crowd-sourced and so that any meme you are thinking of should be searchable!"/>
      <meta name="og:description" content="MemeDB is a massive database of memes. Memes are indexed and metadata is crowd-sourced and so that any meme you are thinking of should be searchable!"/>
      <meta name="keywords" content="meme,memes,image,images,video,videos,gifs,webms,hashtag,search,database,index,meme,memes,database,search,find"/>
    </Head>
    <Browse categories={props.categories} tags={props.tags} preloadMemes={props.memes}/>
  </>;
}
