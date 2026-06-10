export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    let upstream;
    if (path.startsWith('/api/'))      upstream = env.GATEWAY_URL   || 'http://localhost:8080';
    else if (path.startsWith('/board')) upstream = env.BOARD_MFE_URL || 'http://localhost:4200';
    else if (path.startsWith('/tasks')) upstream = env.TASK_MFE_URL  || 'http://localhost:3003';
    else                                upstream = env.SHELL_URL     || 'http://localhost:3002';

    const proxiedUrl = upstream + path + url.search;
    const proxiedRequest = new Request(proxiedUrl, {
      method:  request.method,
      headers: request.headers,
      body:    ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    });

    return fetch(proxiedRequest);
  },
};
