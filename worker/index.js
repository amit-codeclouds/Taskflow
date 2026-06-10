export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    let upstream, proxyPath = path;

    if (path.startsWith('/api/')) {
      // Future API gateway
      upstream = env.GATEWAY_URL || 'http://localhost:8080';
    } else if (path.startsWith('/tasks/_next/')) {
      // Task MFE webpack chunks (remoteEntry.js, etc.) — strip /tasks namespace prefix
      upstream = env.TASK_MFE_URL || 'http://localhost:3003';
      proxyPath = path.slice('/tasks'.length);
    } else if (path.startsWith('/board/')) {
      // Board MFE assets (remoteEntry.js, polyfills, etc.) — strip /board namespace prefix
      upstream = env.BOARD_MFE_URL || 'http://localhost:4200';
      proxyPath = path.slice('/board'.length);
    } else {
      // Shell handles all page routes: /, /tasks, /board, /_next/static/...
      upstream = env.SHELL_URL || 'http://localhost:3002';
    }

    const proxiedUrl = upstream + proxyPath + url.search;
    const proxiedRequest = new Request(proxiedUrl, {
      method:  request.method,
      headers: request.headers,
      body:    ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    });

    return fetch(proxiedRequest);
  },
};
