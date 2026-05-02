/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'image.tmdb.org',
      'via.placeholder.com',
      'lh3.googleusercontent.com',
      'assets.fanart.tv',
      'images.weserv.nl',
    ],
  },
};

module.exports = nextConfig;
