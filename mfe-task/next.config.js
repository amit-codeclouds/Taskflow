/** @type {import('next').NextConfig} */
module.exports = {
  basePath: '/tasks',
  assetPrefix: '/tasks',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};
