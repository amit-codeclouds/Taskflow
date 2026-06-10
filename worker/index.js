export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    let upstream, proxyPath = path;

    if (path.startsWith('/api/')) {
      upstream = env.GATEWAY_URL || 'http://127.0.0.1:8080';
    } else if (path.startsWith('/tasks/_next/')) {
      upstream = env.TASK_MFE_URL || 'http://127.0.0.1:3003';
      proxyPath = path.slice('/tasks'.length);
    } else if (path.startsWith('/board/')) {
      upstream = env.BOARD_MFE_URL || 'http://127.0.0.1:4200';
      proxyPath = path.slice('/board'.length);
    } else {
      upstream = env.SHELL_URL || 'http://127.0.0.1:3002';
    }

    const proxiedUrl = upstream + proxyPath + url.search;

    // Clone headers so we can mutate; drop `host` so upstream sees its own.
    const headers = new Headers(request.headers);
    headers.delete('host');

    const init = {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',
    };

    try {
      return await fetch(proxiedUrl, init);
    } catch (err) {
      return new Response(
        `Worker proxy error\n\nUpstream: ${proxiedUrl}\nReason:   ${err && err.message ? err.message : String(err)}\n\nIs the upstream dev server running?`,
        { status: 502, headers: { 'content-type': 'text/plain' } }
      );
    }
  },
};
