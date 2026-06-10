/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config, { webpack, isServer }) {
    if (!isServer) {
      config.plugins.push(
        new webpack.container.ModuleFederationPlugin({
          name: 'taskMfe',
          filename: 'static/chunks/remoteEntry.js',
          exposes: {
            './TaskApp': './src/app/TaskApp.tsx',
          },
          shared: {
            react: { singleton: true, requiredVersion: false, eager: false },
            'react-dom': { singleton: true, requiredVersion: false, eager: false },
          },
        })
      );
    }
    return config;
  },
};

export default nextConfig;
