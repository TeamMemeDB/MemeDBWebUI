import React from 'react';
import Head from 'next/head';
import clientPromise from '@/lib/mongodb';
import { Meme, Query } from '@/lib/memedb';
import { Browse, SingleMeme } from '@/modules/Layout';
import { getCats } from '@/pages/api/cats';
import { getTags } from '@/pages/api/tags';
import { getMemes } from '@/pages/api/memes';
import { getMeme } from '@/pages/api/meme';

export async function getStaticPaths() {
  const dbClient = await clientPromise;
  const db = dbClient.db('memedb');
  const data = await getMemes(db, Query.create({limit:0, edge:'all'}), true);

  return {
    paths: data['memes'].map((meme:any) => `/meme/${meme._id}`),
    fallback: false
  }
}

export async function getStaticProps(context:any) {
  const dbClient = await clientPromise;
  const db = dbClient.db('memedb');

  return {
    props: {
      data: await getMeme(db, context.params.id, 1),
      tags: await getTags(db),
      categories: await getCats(db)
    }
  };
}

export default function Home(props:any) {
  if(props.data.errorMessage) {
    return <p style={{color:'red'}}>{props.data.errorMessage}</p>;
  }
  const meme = Meme.create(props.data);
  //const { bio, biodetails } = meme.bio();
  const title = "MemeDB Browser";
  const description = "MemeDB is a massive database of memes. Memes are indexed and metadata is crowd-sourced and so that any meme you are thinking of should be searchable!";
  return <>
    <Head>
      <title>{title}</title>
      <meta name="author" content="Yiays"/>
      <meta name="og:title" content={title}/>
      <meta name="description" content={description}/>
      <meta name="og:description" content={description}/>
      <meta name="keywords" content="meme,memes,image,images,video,videos,gifs,webms,hashtag,search,database,index,meme,memes,database,search,find"/>
    </Head>
    <SingleMeme categories={props.categories} tags={props.tags} meme={meme}/>
  </>;
}
