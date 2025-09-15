import React from 'react';
import Head from 'next/head';
import clientPromise from '@/lib/mongodb';
import { DBError, DBMeme, Meme, Query } from '@/lib/memedb';
import { SingleMeme, MemeGrid, DataProps } from '@/modules/Layout';
import { dropdownFormat } from '@/modules/Control';
import { idIndex } from '@/lib/memedb';
import { getCats } from '@/pages/api/cats';
import { getTags } from '@/pages/api/tags';
import { getMemes } from '@/pages/api/memes';
import { getMeme } from '@/pages/api/meme';

export async function getStaticPaths() {
  const dbClient = await clientPromise;
  const db = dbClient.db('memedb');
  const data = await getMemes(db, Query.create({limit:0, edge:'all'}), true);

  return {
    paths: data['memes'].map((meme: DBMeme) => `/meme/${meme._id}`),
    fallback: false
  }
}

export async function getStaticProps(context:{params:{id:string}}) {
  const dbClient = await clientPromise;
  const db = dbClient.db('memedb');

  return {
    props: {
      data: await getMeme(db, Number(context.params.id), 1),
      tags: await getTags(db),
      categories: await getCats(db)
    }
  };
}

export default function Home(props:DataProps & {data:Partial<DBMeme>|DBError}) {
  if('errorMessage' in props.data) {
    return <p style={{color:'red'}}>{props.data.errorMessage}</p>;
  }
  const meme = Meme.create(props.data);
  const mappedCategories = idIndex(dropdownFormat(props.categories));
  const mappedTags = idIndex(dropdownFormat(props.tags));
  const { bio } = meme.bio(mappedCategories, mappedTags);
  const { description: memeDescription } = meme.descriptionWithAuthor();
  const title = bio.substring(0, 20) + (bio.length>20? '...': '') + ' | MemeDB';
  const description = memeDescription || "More information on this meme is needed.";
  const memeTags = meme.tags.reduce<string[]>((out, tagVote) => {
    out.push(mappedTags[tagVote.tag].name);
    return out;
  }, []);
  const tags = ['meme', meme.type].concat(memeTags);
  return <>
    <Head>
      <title>{title}</title>
      <meta name="author" content="Yiays"/>
      <meta name="og:title" content={title}/>
      <meta name="description" content={description}/>
      <meta name="og:description" content={description}/>
      <meta name="keywords" content={tags.join(',')}/>
    </Head>
    <SingleMeme {...props} meme={meme}/>
    <div className="browse">
      <h2>Related memes</h2>
      <MemeGrid {...props} data={{errorMessage: "Feature not implemented yet."}}/>
    </div>
  </>;
}
