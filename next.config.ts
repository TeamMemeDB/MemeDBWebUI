import type { NextConfig } from 'next';
 
const nextConfig: NextConfig = {
  i18n: {
    locales: ['en'],
    defaultLocale: 'en'
  },
  images: {
    remotePatterns: [
      new URL('https://cdn.yiays.com/meme/**')
    ]
  }
}

export default nextConfig;