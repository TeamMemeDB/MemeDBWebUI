import Head from 'next/head';
import clientPromise from '../../lib/mongodb';
import { Query, sortModes } from '../../lib/memedb';
import { Browse } from '../../modules/Layout';
import { getCats } from '../api/cats';
import { getTags } from '../api/tags';
import { getMemes } from '../api/memes';

export async function getStaticPaths() {
  return {
    paths: sortModes.map(sort => `/sort/${sort.id}`),
    fallback: false
  }
}

export async function getStaticProps(context) {
  const dbClient = await clientPromise;
  const db = await dbClient.db('memedb');
  let query = new Query({sort:context.params.sort});

  return {
    props: {
      memes: await getMemes(db, query),
      query: query.toJSON(),
      tags: await getTags(db),
      categories: await getCats(db),
      sortName: query.sort[0].toUpperCase()+query.sort.substring(1)
    }
  };
}

export default function Sort(props) {
  const title = `${props.sortName} memes | MemeDB`;
  const description = {
    'new': "See all the memes that have been added to MemeDB recently.",
    'old': "See the very first memes that were ever added to MemeDB.",
    'top': "See the highest rated memes that have been added to MemeDB so far.",
    'bottom': "See the lowest rated memes that have been added to MemeDB so far."
  }[props.query.sort]
  return <>
    <Head>
      <title>{title}</title>
      <meta name="author" content="Yiays"/>
      <meta name="og:title" content={title}/>
      <meta name="description" content={description}/>
      <meta name="og:description" content={description}/>
      <meta name="keywords" content="meme,memes,image,images,video,videos,gifs,webms,hashtag,search,database,index,meme,memes,database,search,find"/>
    </Head>
    <Browse categories={props.categories} tags={props.tags} data={props.memes} query={props.query}/>
  </>;
}
