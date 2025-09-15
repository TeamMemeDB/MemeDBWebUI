import React from 'react';
import Head from 'next/head';
import clientPromise from '@/lib/mongodb';
import { Query } from '@/lib/memedb';
import { Browse, BrowseProps } from '../../modules/Layout';
import { getCats } from '@/pages/api/cats';
import { getTags } from '@/pages/api/tags';

export async function getStaticProps() {
  const dbClient = await clientPromise;
  const db = dbClient.db('memedb');
  const query = Query.create({tags:''});

  return {
    props: {
      query: query.toJSON(),
      tags: await getTags(db),
      categories: await getCats(db)
    }
  };
}

export default function Home(props: BrowseProps) {
  const title = "All Tags | MemeDB";
  const description = "MemeDB Users have created a wide variety of tags designed to help you find specific memes, topics, trends, or formats.";
  return <>
    <Head>
      <title>{title}</title>
      <meta name="author" content="Yiays"/>
      <meta name="og:title" content={title}/>
      <meta name="description" content={description}/>
      <meta name="og:description" content={description}/>
      <meta name="keywords" content="tag,tags,hashtag,topic,theme,type,trends,formats,search,database,meme"/>
    </Head>
    <Browse {...props}/>
  </>;
}
