import NextFederationPlugin from '@module-federation/nextjs-mf';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config, options) {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'taskMfe',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          './TaskApp': './src/components/TaskApp.tsx',
        },
        shared: {},
      })
    );
    return config;
  },
};

export default nextConfig;
