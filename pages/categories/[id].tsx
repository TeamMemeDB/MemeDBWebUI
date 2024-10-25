import React from 'react';
import Head from 'next/head';
import clientPromise from '@/lib/mongodb';
import { Query } from '@/lib/memedb';
import { Browse } from '../../modules/Layout';
import { getCats } from '@/pages/api/cats';
import { getTags } from '@/pages/api/tags';
import { getMemes } from '@/pages/api/memes';

export async function getStaticPaths() {
  const dbClient = await clientPromise;
  const db = dbClient.db('memedb');
  const categories = await getCats(db);

  return {
    paths: categories.map(category => `/categories/${category._id}`),
    fallback: false
  }
}

export async function getStaticProps(context:any) {
  const dbClient = await clientPromise;
  const db = dbClient.db('memedb');
  let query = Query.create({categories:[parseInt(context.params.id)]});
  const categories = await getCats(db);
  const data = await getMemes(db, query);

  return {
    props: {
      data: data,
      query: query.toJSON(),
      tags: await getTags(db),
      categories: categories,
      chosenCategory: categories.filter(category => category._id == context.params.id)[0]
    }
  };
}

export default function Home(props:any) {
  const title = `${props.chosenCategory.name} memes | MemeDB`;
  const description = props.chosenCategory.description;
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
