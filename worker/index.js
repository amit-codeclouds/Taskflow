export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    let upstream;

    if (path.startsWith('/board')) {
      upstream = env.BOARD_MFE_URL || 'http://localhost:4200';
    } else if (path.startsWith('/tasks')) {
      upstream = env.TASK_MFE_URL || 'http://localhost:3003';
    } else {
      upstream = env.SHELL_URL || 'http://localhost:3002';
    }

    const proxiedRequest = new Request(upstream + path + url.search, {
      method: request.method,
      headers: request.headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',
    });

    try {
      const response = await fetch(proxiedRequest);

      // Upstream returned a redirect — rewrite Location so the browser follows
      // back through the worker (e.g. localhost:8787/login) instead of going
      // directly to the upstream origin (e.g. localhost:3002/login).
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('Location') || '/';
        const corrected = location.startsWith(upstream)
          ? url.origin + location.slice(upstream.length)
          : location; // relative URL — browser resolves against current origin already
        const headers = new Headers(response.headers);
        headers.set('Location', corrected);
        return new Response(null, { status: response.status, headers });
      }

      return response;
    } catch (e) {
      return new Response(
        `502 Bad Gateway — upstream unreachable: ${upstream}\n\nMake sure all apps are running:\n  shell:     cd shell && npm run dev      (port 3002)\n  mfe-task:  cd mfe-task && npm run dev   (port 3003)\n  mfe-board: cd mfe-board && npm start    (port 4200)\n  worker:    cd worker && npx wrangler dev --local  (port 8787)`,
        { status: 502, headers: { 'Content-Type': 'text/plain' } }
      );
    }
  },
};
