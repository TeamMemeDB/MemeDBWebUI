import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <link href="https://fonts.googleapis.com/css?family=Lato:400,400i,700,700i&display=swap" rel="stylesheet"/>
        <link href="https://cdn.yiays.com/yiaycons/yiaycons.css" rel="stylesheet"/>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png"/>
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png"/>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#90CBEF" />
      </Head>
      <body>
        <noscript>JS is not enabled! Your experience may be limited.</noscript>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}