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
  const query = Query.create({categories:''});

  return {
    props: {
      query: query.toJSON(),
      tags: await getTags(db),
      categories: await getCats(db)
    }
  };
}

export default function Home(props: BrowseProps) {
  const title = "All Categories | MemeDB";
  const description = "Categories are a quick way to find specific genres and styles of memes. Some examples include Absurdist memes, Political memes, and Anime memes.";
  return <>
    <Head>
      <title>{title}</title>
      <meta name="author" content="Yiays"/>
      <meta name="og:title" content={title}/>
      <meta name="description" content={description}/>
      <meta name="og:description" content={description}/>
      <meta name="keywords" content="category,categories,genre,theme,type,search,database,meme"/>
    </Head>
    <Browse {...props}/>
  </>;
}
