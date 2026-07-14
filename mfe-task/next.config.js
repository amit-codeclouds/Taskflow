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
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/**' },
    ],
  },
};
