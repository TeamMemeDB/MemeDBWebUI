import Head from 'next/head';
import fetch from 'isomorphic-unfetch';
import {Browse} from '../modules/Layout';
import { getcats } from './api/cats';
import { gettags } from './api/tags';

export async function getStaticProps() {
  var props = {categories: [], tags: []};

  const res = await fetch('http://localhost:3000/api/cats');
  res.json().forEach(cat => {
    props.categories.push({
      id: cat.Id, name:cat.Name.toLowerCase(),
      displayname:cat.Name,
      counter: cat.Votes,
      href:'/category/'+encodeURIComponent(cat.Name.toLowerCase())+'/'+cat.Id,
      description: cat.Description
    });
  });
  
  const res = await fetch('http://localhost:3000/api/tags');
  res.json().forEach(tag => {
    props.tags.push({
      id: tag.Id,
      name: tag.Name.toLowerCase(),
      displayname: '#'+tag.Name,
      counter: tag.Votes,
      href: '/tag/'+encodeURIComponent(tag.Name.toLowerCase())+'/'+tag.Id,
      hidden: (tag.Votes < 1)
    });
  });

  return { props: props };
}

export default function Home(props) {
  return <>
    <Head>
      <title>What is MemeDB?</title>
      <meta name="author" content="Yiays"/>
      <meta name="og:title" content="What is MemeDB?"/>
      <meta name="description" content="MemeDB is a massive database of memes. Memes are indexed and metadata is crowd-sourced and so that any meme you are thinking of should be searchable!"/>
      <meta name="og:description" content="MemeDB is a massive database of memes. Memes are indexed and metadata is crowd-sourced and so that any meme you are thinking of should be searchable!"/>
      <meta name="keywords" content="meme,memes,image,images,video,videos,gifs,webms,hashtag,search,database,index,meme,memes,database,search,find"/>
    </Head>
    <Browse categories={props.categories} tags={props.tags}/>
  </>;
}
