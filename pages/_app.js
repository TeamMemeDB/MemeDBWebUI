import Head from 'next/head';
import '../styles/globals.css';
import '../modules/App.css';
import '../modules/Layout.css';
import '../modules/Control.css';
import '../modules/User.css';
import {Header, Footer} from '../modules/Layout';

function MyApp({ Component, pageProps }) {
  return(<>
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
    <noscript>You need to enable JavaScript to access MemeDB.</noscript>
    <Header/>
    <Component {...pageProps} />
    <Footer/>
  </>)
}

export default MyApp
