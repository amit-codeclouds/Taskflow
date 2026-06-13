/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';
const taskMfeUrl = isDev ? 'http://localhost:3003' : process.env.TASK_MFE_URL;
const boardMfeUrl = isDev ? 'http://localhost:4200' : process.env.BOARD_MFE_URL;

if (!isDev) {
  if (!taskMfeUrl) throw new Error('TASK_MFE_URL env var is required for production builds');
  if (!boardMfeUrl) throw new Error('BOARD_MFE_URL env var is required for production builds');
}

const nextConfig = {
  async rewrites() {
    return [
      { source: '/tasks', destination: `${taskMfeUrl}/tasks` },
      { source: '/tasks/:path*', destination: `${taskMfeUrl}/tasks/:path*` },
      { source: '/board', destination: `${boardMfeUrl}/board` },
      { source: '/board/:path*', destination: `${boardMfeUrl}/board/:path*` },
    ];
  },
};

module.exports = nextConfig;
