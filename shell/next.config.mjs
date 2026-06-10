import { ModuleFederationPlugin } from '@module-federation/enhanced/webpack';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config, { isServer }) {
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        ({ request }, callback) => {
          if (request && (request.startsWith('taskMfe/') || request.startsWith('boardMfe/'))) {
            return callback(null, 'commonjs ' + request);
          }
          callback();
        },
      ];
    } else {
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
