import React, { useEffect } from 'react';
import Head from 'next/head';
import { useState } from 'react';
import '../styles/globals.css';
import '../modules/Layout.css';
import '../modules/Control.css';
import '../modules/User.css';
import {Header, Footer} from '../modules/Layout';
import { Query } from '@/lib/memedb';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }:any) {
  const router = useRouter();
  const [query] = useState(Query.create(pageProps.query || {}));
  const [loading, setLoading] = useState(false);
  
  function navigate(nextQuery:Query) {
    if(!query.equals(nextQuery))
      router.push(nextQuery?.toUrl());
  }
  
  useEffect(() => {
    router.events.on("routeChangeStart", () => setLoading(true));
    router.events.on("routeChangeComplete", () => setLoading(false));

    return () => {
      router.events.off("routeChangeStart", () => setLoading(true));
      router.events.off("routeChangeComplete", () => setLoading(false));
    };
  }, []);

  return <>
    <Head>
      <link rel="icon" href="/favicon.ico" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#90CBEF" />

      <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png"/>
      <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png"/>
      <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png"/>
      <link rel="manifest" href="/manifest.json" />
    </Head>
    <link href="https://fonts.googleapis.com/css?family=Lato:400,400i,700,700i&display=swap" rel="stylesheet"/>
    <link href="https://cdn.yiays.com/yiaycons/yiaycons.css" rel="stylesheet"/>
    <noscript>JS is not enabled! Your experience may be limited.</noscript>
    <Header query={query} setQuery={navigate}/>
    {(loading)?
      <div className="browse"><p>Loading...</p></div>
    :
      <Component {...pageProps} query={query}/>
    }
    <Footer/>
  </>
}

export default MyApp
