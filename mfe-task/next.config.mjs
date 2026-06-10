import { ModuleFederationPlugin } from '@module-federation/enhanced/webpack';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config, options) {
    if (!options.isServer) {
      config.plugins.push(
        new ModuleFederationPlugin({
          name: 'taskMfe',
          filename: 'static/chunks/remoteEntry.js',
          exposes: {
            './TaskApp': './src/components/TaskApp.tsx',
          },
          shared: {},
        })
      );
    }
    return config;
  },
};

export default nextConfig;
