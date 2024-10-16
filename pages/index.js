import Head from 'next/head';
import clientPromise from '../lib/mongodb';
import { Query } from '../lib/memedb';
import { Browse } from '../modules/Layout';
import { getCats } from './api/cats';
import { getTags } from './api/tags';
import { getMemes } from './api/memes';

export async function getStaticProps() {
  const dbClient = await clientPromise;
  const db = await dbClient.db('memedb');
  const query = new Query({});

  return {
    props: {
      memes: await getMemes(db, query),
      query: query.toJSON(),
      tags: await getTags(db),
      categories: await getCats(db)
    }
  };
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
    <Browse categories={props.categories} tags={props.tags} data={props.memes} query={props.query}/>
  </>;
}
