import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { AppProps } from 'next/app';
import { useState } from 'react';
import '../styles/globals.css';
import '../modules/Layout.css';
import '../modules/Control.css';
import '../modules/User.css';
import {Header, Footer} from '../modules/Layout';
import { Query } from '@/lib/memedb';

function MyApp({ Component, pageProps }:AppProps) {
  const router = useRouter();
  const [query, setQuery] = useState(Query.create(pageProps.query || {}));
  const [loading, setLoading] = useState(false);
  
  function navigate(nextQuery:Query) {
    if(!query.equals(nextQuery)) {
      setQuery(nextQuery);
      router.push(nextQuery?.toUrl());
    }
  }
  
  useEffect(() => {
    router.events.on("routeChangeStart", () => setLoading(true));
    router.events.on("routeChangeComplete", () => setLoading(false));

    return () => {
      router.events.off("routeChangeStart", () => setLoading(true));
      router.events.off("routeChangeComplete", () => setLoading(false));
    };
  }, [router.events]);

  return <>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
    <Header query={query} setQuery={navigate}/>
    {(loading)?
      <div className="browse"><p>Loading...</p></div>
    :
      <Component {...pageProps} query={query} setQuery={navigate}/>
    }
    <Footer/>
  </>
}

export default MyApp
