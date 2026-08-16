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
      // Do NOT follow redirects here — otherwise an upstream 3xx (e.g. the shell's
      // auth middleware redirecting to /login) gets resolved server-side and the
      // browser never sees it, so its URL never changes.
      redirect: 'manual',
    });

    try {
      const response = await fetch(proxiedRequest);

      // Pass upstream redirects back to the browser. Rewrite same-upstream
      // Location headers to the worker's own origin so navigation stays behind
      // this single entry point instead of jumping to the upstream host.
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (location) {
          const upstreamOrigin = new URL(upstream).origin;
          const dest = new URL(location, upstream);
          const headers = new Headers(response.headers);
          if (dest.origin === upstreamOrigin) {
            headers.set('location', new URL(dest.pathname + dest.search + dest.hash, url.origin).toString());
          }
          return new Response(null, { status: response.status, headers });
        }
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