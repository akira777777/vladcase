/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
};

module.exports = nextConfig;
