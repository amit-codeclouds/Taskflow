# worker — Progress Doc

## App Overview

| Key | Value |
|-----|-------|
| Role | Cloudflare Worker — reverse proxy, single browser entry point |
| Runtime | Cloudflare Workers (ES module format) |
| Port | 8787 (local dev via `npx wrangler dev --local`) |
| Browser entry | http://localhost:8787 |

---

## Phase 0 — MFE Foundation

**Status: COMPLETE**

### Route table (current — simplified for iframe approach)

| Path pattern | Upstream target | Default local URL |
|---|---|---|
| `/api/*` | `env.GATEWAY_URL` | `http://localhost:8080` |
| everything else | `env.SHELL_URL` | `http://localhost:3002` |

> **Why there are only 2 branches:** In the iframe approach, the Shell embeds MFEs directly (`<iframe src="localhost:3003">`). MFE assets load directly from their own origins — they do not flow through the worker. There is no need to proxy `/tasks/*` or `/board/*` to the MFE servers.
>
> Earlier the worker had 4 branches (`/api`, `/board`, `/tasks`, catch-all). Those `/board` and `/tasks` branches were required when MF remoteEntry.js files were being served through the worker. They have been removed.

### Error handling

The worker returns a plain-text `502 Bad Gateway` response with a helpful startup message if the upstream is unreachable (e.g. Shell is not running).

### Implemented files

| File | Description |
|------|-------------|
| `index.js` | Fetch handler — 2-branch route, proxy with method/headers/body, 502 error response |
| `wrangler.toml` | Worker name: `taskflow-router`, compatibility date: `2024-01-01` |

### How to run locally

```bash
cd worker && npx wrangler dev --local
# Type 'y' when prompted on first run
# Opens at http://localhost:8787
```

### Definition of done (Phase 0)

- [x] Worker runs on port 8787
- [x] Everything except `/api` proxied to Shell (port 3002)
- [x] `/api/*` route stub in place for future gateway
- [x] 502 response with startup hint if upstream is unreachable
- [x] Simplified from 4 branches to 2 (MFE branches removed — not needed for iframe approach)

---

## Known Issues / Limitations

- No `wrangler.toml` env var bindings defined — all upstreams fall back to hardcoded localhost defaults. Acceptable for local dev.
- Worker does not add CORS headers. If any client-side cross-origin fetch is needed through the worker in Phase 1, CORS handling must be added.

---

## Phase 1 — Planned

- Add `SHELL_URL`, `TASK_MFE_URL`, `BOARD_MFE_URL`, `GATEWAY_URL` bindings in `wrangler.toml` for staging/prod
- Add CORS headers if needed
- Add request logging

---

*Last updated: 2026-06-10 — Simplified from 4-branch to 2-branch routing (iframe approach — MFE branches not needed)*
