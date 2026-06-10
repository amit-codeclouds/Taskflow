import { ModuleFederationPlugin } from '@module-federation/enhanced/webpack';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config, options) {
    if (!options.isServer) {
      config.plugins.push(
        new ModuleFederationPlugin({
          name: 'shell',
          remotes: {
            taskMfe: `taskMfe@http://localhost:8787/tasks/_next/static/chunks/remoteEntry.js`,
            boardMfe: `boardMfe@http://localhost:8787/board/remoteEntry.js`,
          },
          shared: {},
        })
      );
    }
    return config;
  },
};

export default nextConfig;
