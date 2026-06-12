/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const isDev = process.env.NODE_ENV === 'development';
    const taskMfeUrl = isDev ? 'http://localhost:3003' : process.env.NEXT_PUBLIC_TASK_MFE_URL;
    const boardMfeUrl = isDev ? 'http://localhost:4200' : process.env.NEXT_PUBLIC_BOARD_MFE_URL;

    if (!isDev) {
      if (!taskMfeUrl) throw new Error('NEXT_PUBLIC_TASK_MFE_URL env var is required in production');
      if (!boardMfeUrl) throw new Error('NEXT_PUBLIC_BOARD_MFE_URL env var is required in production');
    }

    return [
      { source: '/tasks', destination: `${taskMfeUrl}/tasks` },
      { source: '/tasks/:path*', destination: `${taskMfeUrl}/tasks/:path*` },
      { source: '/board', destination: `${boardMfeUrl}/board` },
      { source: '/board/:path*', destination: `${boardMfeUrl}/board/:path*` },
    ];
  },
};

module.exports = nextConfig;
