/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'raw.githubusercontent.com', 'community.cloudflare.steamstatic.com'],
  },
};

module.exports = nextConfig;
