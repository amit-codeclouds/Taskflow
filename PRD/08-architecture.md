# Architecture Requirements

## Overview

Taskflow is a **micro-frontend (MFE) application** using the **Next.js Multi-Zones** pattern. Three independent frontend apps compose into one product through a Cloudflare Worker gateway that routes requests by URL path.

---

## Why Multi-Zones (not Module Federation)

| Approach | Problem |
|---|---|
| Module Federation (`@module-federation/nextjs-mf`) | Only supports Next.js Pages Router. Incompatible with App Router. |
| Next.js Multi-Zones | Vercel's official MFE pattern for App Router. Uses `rewrites` to proxy paths. No Webpack plugin. No `remoteEntry.js`. |
| Angular Native Federation | Only needed if Angular components are loaded *inside* a React page without a page transition. We navigate to `/board` (hard reload), so this is not needed. |

---

## Apps and Ports

| App | Framework | Port | Path prefix | Notes |
|---|---|---|---|---|
| Cloudflare Worker | Wrangler | **8787** | All paths | Gateway — open this in browser |
| Shell | Next.js 14.2 | **3002** | `/`, `/teams`, `/people`, `/settings` | Main host app |
| Task MFE | Next.js 14.2 | **3003** | `/tasks` | basePath + assetPrefix = `/tasks` |
| Board MFE | Angular 17.3 | **4200** | `/board` | baseHref = `/board/` |

---

## Request Routing

### Cloudflare Worker (edge layer)

```
Browser → localhost:8787 (Cloudflare Worker)
                │
         ┌──────┴──────────────────────────┐
         │  path.startsWith('/api/')         │ → GATEWAY_URL (http://localhost:8080)
         │  path.startsWith('/board')        │ → BOARD_MFE_URL (http://localhost:4200)
         │  path.startsWith('/tasks')        │ → TASK_MFE_URL (http://localhost:3003)
         │  everything else                  │ → SHELL_URL (http://localhost:3002)
         └─────────────────────────────────┘
```

The Worker proxies the full request — method, headers, body — and returns the upstream response.  
On upstream failure: returns `502 Bad Gateway`.

### Shell Next.js Rewrites (zone layer)

The Shell also has `rewrites` in `next.config.js` for when assets are fetched server-side or via `<Link>` within the shell zone:

```
/tasks     → http://localhost:3003/tasks      (dev)
/tasks/:p* → http://localhost:3003/tasks/:p*
/board     → http://localhost:4200/board
/board/:p* → http://localhost:4200/board/:p*
```

In production these rewrite to environment variables `TASK_MFE_URL` and `BOARD_MFE_URL`.

---

## App Configuration

### Shell (`shell/next.config.js`)

```js
module.exports = {
  transpilePackages: ['@taskflow/ui'],
  async rewrites() { ... }
};
```

### Task MFE (`mfe-task/next.config.js`)

```js
module.exports = {
  basePath: '/tasks',
  assetPrefix: '/tasks',
  transpilePackages: ['@taskflow/ui'],
};
```

`basePath` ensures all internal routes are prefixed with `/tasks`.  
`assetPrefix` ensures `/_next/static/...` assets are fetched as `/tasks/_next/static/...`.

### Board MFE (`mfe-board/angular.json`)

```json
"build": {
  "options": {
    "baseHref": "/board/"
  }
}
```

`baseHref` ensures Angular's router and asset URLs are prefixed with `/board/`.

---

## Shared UI Package

```
packages/ui/
├── src/
│   ├── NavBar.tsx    — shared top nav (uses <a> tags only)
│   └── index.ts      — exports { NavBar }
└── package.json      — name: "@taskflow/ui"
```

Referenced via `file:` path in Shell and Task MFE:

```json
// shell/package.json and mfe-task/package.json
{
  "dependencies": {
    "@taskflow/ui": "file:../packages/ui"
  }
}
```

**No npm workspaces.** Each app has its own independent `node_modules`. The `file:` reference means each app installs `@taskflow/ui` locally into its own `node_modules` when `npm install` runs.

---

## Navigation Rules

Cross-zone navigation (between Shell ↔ Task MFE ↔ Board MFE) must always use plain `<a>` HTML tags, never `<Link>` (Next.js) or `[routerLink]` (Angular) for cross-zone links.

| Navigation type | Tag to use |
|---|---|
| Within Shell zone | `<Link href="...">` |
| Within Task MFE zone | `<Link href="...">` |
| Within Board MFE zone | `[routerLink]` |
| Shell → Tasks/Board | `<a href="...">` |
| Tasks → Shell/Board | `<a href="...">` |
| Board → Shell/Tasks | `<a href="...">` (plain HTML) |

---

## Authentication Across Zones

All zones share the same httpOnly session cookie because all traffic routes through the same domain (the Cloudflare Worker):

```
localhost:8787/        → cookie sent
localhost:8787/tasks   → same cookie sent automatically
localhost:8787/board   → same cookie sent automatically
```

No cross-origin issues. No token passing. The cookie IS the cross-zone auth mechanism.

---

## Environment Variables

### `worker/.dev.vars` (Wrangler local dev, never committed)

```env
SHELL_URL=http://localhost:3002
TASK_MFE_URL=http://localhost:3003
BOARD_MFE_URL=http://localhost:4200
GATEWAY_URL=http://localhost:8080
```

### `worker/wrangler.toml` (production values, committed)

```toml
[vars]
SHELL_URL      = "https://taskflow-shell.vercel.app"
TASK_MFE_URL   = "https://taskflow-task.vercel.app"
BOARD_MFE_URL  = "https://taskflow-board.vercel.app"
GATEWAY_URL    = "https://taskflow-gateway.up.railway.app"
```

### `shell/.env.local`

```env
NEXT_PUBLIC_TASK_MFE_URL=http://localhost:3003
NEXT_PUBLIC_BOARD_MFE_URL=http://localhost:4200
```

### `mfe-task/.env.local`

Empty for Phase 0. Add `NEXT_PUBLIC_` vars when the Task MFE needs to call services directly.

### `mfe-board/` (Angular)

No env file. Environment-specific values go in `src/environments/environment.ts`.

---

## Database Architecture (Planned)

### PostgreSQL — relational data

| Table | Data |
|---|---|
| `users` | Auth + profile |
| `teams` | Team metadata |
| `team_members` | User ↔ Team membership |
| `projects` | Project metadata |
| `project_members` | User ↔ Project membership |
| `sprints` | Sprint metadata |
| `tasks` | Task records |
| `labels` | Label definitions |
| `task_labels` | Task ↔ Label M:M |
| `comments` | Task comments |
| `invitations` | Workspace/team invitations |

### MongoDB Atlas — document data

| Collection | Data |
|---|---|
| `activity_logs` | Append-only audit trail per entity |
| `notifications` | Per-user notification inbox |
| `user_preferences` | Theme, sidebar state, notification settings |
| `audit_trail` | Service-level API request log (90-day TTL) |

---

## Monorepo Structure

```
taskflow/
├── CLAUDE.md                  — project instructions
├── package.json               — root dev scripts (concurrently)
├── packages/ui/               — shared NavBar component
├── worker/                    — Cloudflare Worker (index.js + wrangler.toml)
├── shell/                     — Next.js 14, port 3002
├── mfe-task/                  — Next.js 14, port 3003
└── mfe-board/                 — Angular 17.3, port 4200
```

**No root-level `node_modules` for app code.** Each app installs its own dependencies independently.

---

## Running Locally (4 terminals)

```bash
# Terminal 1
cd shell && npm install && npm run dev          # :3002

# Terminal 2
cd mfe-task && npm install && npm run dev       # :3003

# Terminal 3
cd mfe-board && npm install && npm start        # :4200

# Terminal 4
cd worker && npx wrangler dev --local           # :8787

# Browser → localhost:8787
```

---

## Deployment (Production)

| App | Platform |
|---|---|
| Shell | Vercel |
| Task MFE | Vercel |
| Board MFE | Vercel (static) or Cloudflare Pages |
| Worker | Cloudflare Workers |
| API Gateway | Railway (planned) |
| PostgreSQL | Railway or Supabase (planned) |
| MongoDB Atlas | MongoDB Atlas cloud (planned) |

---

## Definition of Done (Phase 0)

- [ ] `localhost:8787` opens the Shell home page
- [ ] Clicking "Go to Tasks" navigates to `localhost:8787/tasks` and renders Task MFE
- [ ] Clicking "Go to Board" navigates to `localhost:8787/board` and renders Board MFE
- [ ] The NavBar appears consistently across all three pages
- [ ] All three apps run independently on their own ports
- [ ] No 404s, no broken asset paths, no CORS errors in the console
- [ ] `basePath` and `assetPrefix` are correctly set — no `/_next` asset 404s
