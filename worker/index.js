export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const upstream = path.startsWith('/api/')
      ? (env.GATEWAY_URL || 'http://localhost:8080')
      : (env.SHELL_URL   || 'http://localhost:3002');

    const proxiedRequest = new Request(upstream + path + url.search, {
      method:  request.method,
      headers: request.headers,
      body:    ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    });

    try {
      return await fetch(proxiedRequest);
    } catch (e) {
      return new Response(
        `502 Bad Gateway — upstream unreachable: ${upstream}\n\nMake sure all apps are running:\n  shell:     cd shell && npm run dev      (port 3002)\n  mfe-task:  cd mfe-task && npm run dev   (port 3003)\n  mfe-board: cd mfe-board && npm start    (port 4200)`,
        { status: 502, headers: { 'Content-Type': 'text/plain' } }
      );
    }
  },
};
