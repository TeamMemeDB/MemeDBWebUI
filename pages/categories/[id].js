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
  const categories = await getCats(db);

  return {
    paths: categories.map(category => `/categories/${category._id}`),
    fallback: false
  }
}

export async function getStaticProps(context) {
  const dbClient = await clientPromise;
  const db = await dbClient.db('memedb');
  let query = new Query({categories:[parseInt(context.params.id)]});
  const categories = await getCats(db);
  const memes = await getMemes(db, query);

  return {
    props: {
      memes: memes,
      query: query.toJSON(),
      tags: await getTags(db),
      categories: categories,
      chosenCategory: categories.filter(category => category._id == context.params.id)[0]
    }
  };
}

export default function Home(props) {
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
    <Browse categories={props.categories} tags={props.tags} data={props.memes} query={props.query}/>
  </>;
}
