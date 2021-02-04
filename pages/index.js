import Head from 'next/head';
import {Browse} from '../modules/Layout';
import { getcats } from './api/cats';

export async function getStaticProps() {
  var props = {categories: []};
  await getcats((err, results, fields) => {
    if(!err){
      results.forEach(cat => {
        props.categories.push({id: cat.Id, name:cat.Name.toLowerCase(), displayname:cat.Name, href:'/category/'+cat.Name.toLowerCase()+'/'+cat.Id})
      });
    }else{
      console.error(err);
    }
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
    <Browse categories={props.categories}/>
  </>;
}
