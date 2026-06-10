/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/tasks',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:3003/tasks'
            : `${process.env.TASK_MFE_URL}/tasks`,
      },
      {
        source: '/tasks/:path*',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:3003/tasks/:path*'
            : `${process.env.TASK_MFE_URL}/tasks/:path*`,
      },
      {
        source: '/board',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:4200/board'
            : `${process.env.BOARD_MFE_URL}/board`,
      },
      {
        source: '/board/:path*',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:4200/board/:path*'
            : `${process.env.BOARD_MFE_URL}/board/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
