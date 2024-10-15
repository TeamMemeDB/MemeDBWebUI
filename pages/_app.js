import Head from 'next/head';
import { useState } from 'react';
import '../styles/globals.css';
import '../modules/Layout.css';
import '../modules/Control.css';
import '../modules/User.css';
import {Header, Footer} from '../modules/Layout';

function MyApp({ Component, pageProps }) {
  const [filter, setFilter] = useState('');

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
    <Header filter={filter} setFilter={setFilter}/>
    <Component {...pageProps} filter={filter} setFilter={setFilter}/>
    <Footer/>
  </>
}

export default MyApp
