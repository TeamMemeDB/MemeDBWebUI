import Head from 'next/head';
import clientPromise from '../../lib/mongodb';
import { Query } from '../../lib/memedb';
import { Browse } from '../../modules/Layout';
import { getCats } from '../api/cats';
import { getTags } from '../api/tags';

export async function getStaticProps() {
  const dbClient = await clientPromise;
  const db = await dbClient.db('memedb');
  let query = new Query({tags:[]});

  return {
    props: {
      query: query.toJSON(),
      tags: await getTags(db),
      categories: await getCats(db)
    }
  };
}

export default function Home(props) {
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
    <Browse categories={props.categories} tags={props.tags} query={props.query}/>
  </>;
}
