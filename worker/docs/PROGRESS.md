# worker — Progress Doc

## App Overview

| Key | Value |
|-----|-------|
| Role | Cloudflare Worker — reverse proxy router (single entry point) |
| Runtime | Cloudflare Workers (ES module format) |
| Port | 8787 (local dev via `npx wrangler dev --local`) |
| Browser entry | http://localhost:8787 |

---

## Phase 0 — MFE Foundation

**Status: COMPLETE**

### Route table

| Path pattern | Upstream target | Default local URL |
|-------------|-----------------|-------------------|
| `/api/*` | `GATEWAY_URL` env var | `http://localhost:8080` |
| `/board/*` | `BOARD_MFE_URL` env var | `http://localhost:4200` |
| `/tasks/*` | `TASK_MFE_URL` env var | `http://localhost:3003` |
| `*` (catch-all) | `SHELL_URL` env var | `http://localhost:3002` |

### Implemented files

| File | Description |
|------|-------------|
| `index.js` | Single fetch handler — parses pathname, picks upstream, proxies request including method/headers/body |
| `wrangler.toml` | Worker name: `taskflow-router`, compatibility date: `2024-01-01` |

### How to run locally

```bash
cd worker && npx wrangler dev --local
# opens at http://localhost:8787
```

### Definition of done (Phase 0)

- [x] Worker runs on port 8787
- [x] `/tasks/*` proxied to mfe-task (3003)
- [x] `/board/*` proxied to mfe-board (4200)
- [x] `*` (catch-all) proxied to shell (3002)
- [x] `/api/*` route stub in place for future gateway

---

## Phase 1 — Planned

- Wire real env vars (`SHELL_URL`, `TASK_MFE_URL`, `BOARD_MFE_URL`, `GATEWAY_URL`) for staging/production deployment
- Add CORS headers if cross-origin requests are needed
- Add request logging or error response handling

---

## Known Issues / Notes

- No `wrangler.toml` env var bindings defined yet — all upstreams fall back to hardcoded localhost defaults. This is fine for local dev.

---

*Last updated: 2026-06-10 — Phase 0 complete*
