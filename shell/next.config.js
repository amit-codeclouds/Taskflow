/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        { source: '/tasks',        destination: 'http://localhost:3003/tasks'        },
        { source: '/tasks/:path*', destination: 'http://localhost:3003/tasks/:path*' },
        { source: '/board',        destination: 'http://localhost:4200/board'        },
        { source: '/board/:path*', destination: 'http://localhost:4200/board/:path*' },
      ];
    }

    const rewrites = [];
    const taskUrl  = process.env.TASK_MFE_URL;
    const boardUrl = process.env.BOARD_MFE_URL;

    if (taskUrl) {
      rewrites.push(
        { source: '/tasks',        destination: `${taskUrl}/tasks`        },
        { source: '/tasks/:path*', destination: `${taskUrl}/tasks/:path*` },
      );
    }
    if (boardUrl) {
      rewrites.push(
        { source: '/board',        destination: `${boardUrl}/board`        },
        { source: '/board/:path*', destination: `${boardUrl}/board/:path*` },
      );
    }
    return rewrites;
  },
};

module.exports = nextConfig;
