import React from 'react';
import Head from 'next/head';
import clientPromise from '../lib/mongodb';
import { Query, RawQuery } from '../lib/memedb';
import { Browse, BrowseProps } from '../modules/Layout';
import { getCats } from './api/cats';
import { getTags } from './api/tags';
import { getMemes } from './api/memes';

export async function getServerSideProps(context: {query:RawQuery}) {
  const dbClient = await clientPromise;
  const db = dbClient.db('memedb');
  const query = Query.create(context.query || {});

  return {
    props: {
      data: await getMemes(db, query),
      query: query.toJSON(),
      tags: await getTags(db),
      categories: await getCats(db)
    }
  };
}

export default function Home(props:BrowseProps) {
  const delta = Query.create({}).difference(props.query);
  const pageKeys = Object.keys(delta).filter(key => ['categories', 'tags', 'filter'].includes(key));

  let title:string;
  if(pageKeys.length==1 && pageKeys[0]=='filter')
    title = `'${delta.filter}' Search | MemeDB`;
  else if(pageKeys.includes('filter'))
    title = `'${delta.filter}' Advanced Search | MemeDB`;
  else title = "Advanced Search | MemeDB";
  const description = "Use the provided search filters to refine down the 1000s of memes in MemeDB to the one you want.";
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
