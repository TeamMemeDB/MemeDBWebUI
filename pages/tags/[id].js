import Head from 'next/head';
import clientPromise from '../../lib/mongodb';
import { Query } from '../../lib/memedb';
import { Browse } from '../../modules/Layout';
import { getCats } from '../api/cats';
import { getTags } from '../api/tags';
import { getMemes } from '../api/memes';

export async function getStaticPaths() {
  const dbClient = await clientPromise;
  const db = await dbClient.db('memedb');
  const tags = await getTags(db);

  return {
    paths: tags.map(tag => `/tags/${tag._id}`),
    fallback: false
  }
}

export async function getStaticProps(context) {
  const dbClient = await clientPromise;
  const db = await dbClient.db('memedb');
  let query = new Query({tags:[parseInt(context.params.id)]});
  const tags = await getTags(db);

  return {
    props: {
      memes: await getMemes(db, query),
      query: query.toJSON(),
      tags: tags,
      categories: await getCats(db),
      chosenTag: tags.filter(tag => tag._id == context.params.id)[0]
    }
  };
}

export default function Home(props) {
  const title = `#${props.chosenTag.name} memes | MemeDB`;
  const description = `These memes have been given the #${props.chosenTag.name} tag by the MemeDB community.`;
  return <>
    <Head>
      <title>{title}</title>
      <meta name="author" content="Yiays"/>
      <meta name="og:title" content={title}/>
      <meta name="description" content={description}/>
      <meta name="og:description" content={description}/>
      <meta name="keywords" content="tag,tags,hashtag,topic,theme,type,trends,formats,search,database,meme"/>
    </Head>
    <Browse categories={props.categories} tags={props.tags} data={props.memes} query={props.query}/>
  </>;
}
