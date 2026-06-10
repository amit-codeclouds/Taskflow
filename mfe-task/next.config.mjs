import { ModuleFederationPlugin } from '@module-federation/enhanced/webpack';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config, { isServer }) {
    config.output.publicPath = 'auto';

    if (!isServer) {
      config.plugins.push(
        new ModuleFederationPlugin({
          name: 'taskMfe',
          filename: 'static/chunks/remoteEntry.js',
          exposes: {
            './TaskApp': './src/components/TaskApp.tsx',
          },
          shared: {},
          library: { type: 'window', name: 'taskMfe' },
          runtime: false,
        })
      );
    }
    return config;
  },
};

export default nextConfig;
