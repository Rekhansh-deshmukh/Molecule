// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cactus.nci.nih.gov',
        pathname: '/chemical/structure/**',
      },
      {
        protocol: 'https',
        hostname: 'www.commonchemistry.org',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
    ],
  },
};

module.exports = nextConfig;

