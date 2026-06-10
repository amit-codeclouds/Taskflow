# Taskflow — CLAUDE.md

> Read this fully before writing any code.
> This file covers exactly what we build right now — nothing more.

---

## What we are building

Three independent frontend apps that compose into one product via routing.

- **Shell** — Next.js 14 app. Owns the nav bar, layout, and auth cookie. Routes `/tasks/*` to Task MFE and `/board/*` to Board MFE via `rewrites`.
- **Task MFE** — Next.js 14 app. Serves all task-related pages under `/tasks`.
- **Board MFE** — Angular 17 app. Serves all board-related pages under `/board`.
- **Worker** — Cloudflare Worker. The single entry point. Routes all traffic to the correct app by URL path.

No backend. No API calls. No auth logic beyond a placeholder cookie stub.
Each app shows a clean placeholder UI — no real data yet.

---

## Why this approach

**Next.js Multi-Zones** — not Module Federation.

Module Federation (`@module-federation/nextjs-mf`) only supports the Pages Router.
Next.js App Router is incompatible with the MF webpack plugin.
Vercel's own answer for MFE with App Router is Multi-Zones — rewrites in `next.config.js`
that proxy paths to other deployed Next.js apps. No Webpack plugin. No `remoteEntry.js`.

**Angular 17 — standalone app, no federation plugin.**

The Board MFE is routed to directly by the Cloudflare Worker (`/board/*`).
The Shell never embeds the Board app as a runtime component — it navigates to it (hard reload).
Native Federation would only be needed if we were loading Angular components
*inside* a Next.js page without a page transition. We are not doing that.
A plain Angular 17 standalone app is correct. No `federation.config.js` needed.

---

## Exact versions

| App | Framework | Version |
|---|---|---|
| shell | Next.js | **14.2.x** (installed: 14.2.35) |
| mfe-task | Next.js | **14.2.x** (must match shell) |
| mfe-board | Angular CLI | **17.3.x** (installed: 17.3.17) |

---

## Monorepo structure

```
taskflow/
├── CLAUDE.md                  ← this file
├── package.json               ← root (concurrently scripts only — no workspaces)
├── .env.example
│
├── packages/
│   └── ui/                    ← shared nav bar component (React)
│       ├── package.json       ← name: @taskflow/ui
│       └── src/
│           ├── NavBar.tsx     ← used by Shell and Task MFE
│           └── index.ts
│
├── worker/                    ← Cloudflare Worker — single entry point
│   ├── index.js
│   └── wrangler.toml
│
├── shell/                     ← Next.js 14, port 3002, src/app/
│   ├── next.config.js         ← rewrites: /tasks/* → Task MFE, /board/* → Board MFE
│   ├── package.json
│   └── src/app/
│       ├── layout.tsx         ← global layout with NavBar
│       ├── page.tsx           ← home — welcome screen
│       ├── tasks/
│       │   └── page.tsx       ← stub — rewrites proxy to Task MFE before this renders
│       ├── board/
│       │   └── page.tsx       ← stub — rewrites proxy to Board MFE before this renders
│       └── api/auth/
│           └── route.ts       ← Phase 0 auth cookie stub
│
├── mfe-task/                  ← Next.js 14, port 3003, src/app/
│   ├── next.config.js         ← basePath: '/tasks', assetPrefix: '/tasks'
│   ├── package.json
│   └── src/app/
│       ├── layout.tsx         ← imports NavBar from @taskflow/ui
│       └── page.tsx           ← placeholder: "Tasks coming in Phase 1"
│
└── mfe-board/                 ← Angular 17.3, port 4200
    ├── angular.json           ← baseHref: '/board/'
    ├── package.json
    └── src/app/
        ├── app.component.ts
        ├── app.config.ts
        ├── app.routes.ts
        └── board/
            └── board.component.ts  ← placeholder: "Board coming in Phase 2"
```

---

## Port map

| App | Port | Notes |
|---|---|---|
| Cloudflare Worker | **8787** | `wrangler dev --local` — open this in browser |
| Shell | **3002** | port 3001 is taken by another project |
| Task MFE | **3003** | |
| Board MFE | **4200** | Angular CLI default |

---

## Shared package — no workspaces

Each app has its own independent `node_modules`. No root-level hoisting.

`@taskflow/ui` is referenced via a `file:` path in shell and mfe-task so each team
installs it locally into their own `node_modules` when they run `npm install`:

```json
// shell/package.json and mfe-task/package.json
{
  "dependencies": {
    "@taskflow/ui": "file:../packages/ui"
  }
}
```

The source lives in `packages/ui/src/` as the single source of truth.
Each app installs it independently — no shared hoisting, no workspace symlinks.

Each team installs and runs their app independently:
- `cd shell && npm install && npm run dev`
- `cd mfe-task && npm install && npm run dev`
- `cd mfe-board && npm install && npm start`

---

## Multi-Zones wiring — the only config that matters

### Shell `next.config.js` — the host

```js
/** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: ['@taskflow/ui'],
  async rewrites() {
    return [
      {
        source: '/tasks',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:3003/tasks'
            : `${process.env.TASK_MFE_URL}/tasks`,
      },
      {
        source: '/tasks/:path*',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:3003/tasks/:path*'
            : `${process.env.TASK_MFE_URL}/tasks/:path*`,
      },
      {
        source: '/board',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:4200/board'
            : `${process.env.BOARD_MFE_URL}/board`,
      },
      {
        source: '/board/:path*',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:4200/board/:path*'
            : `${process.env.BOARD_MFE_URL}/board/:path*`,
      },
    ];
  },
};
```

### Task MFE `next.config.js` — zone config

```js
/** @type {import('next').NextConfig} */
module.exports = {
  basePath: '/tasks',
  assetPrefix: '/tasks',
  transpilePackages: ['@taskflow/ui'],
};
```

### Board MFE `angular.json` — base href

```json
"build": {
  "builder": "@angular-devkit/build-angular:browser",
  "options": {
    "baseHref": "/board/",
    "main": "src/main.ts"
  }
}
```

---

## Cloudflare Worker (`worker/index.js`)

```js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    let upstream;

    if (path.startsWith('/api/')) {
      upstream = env.GATEWAY_URL || 'http://localhost:8080';
    } else if (path.startsWith('/board')) {
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
    });

    try {
      return await fetch(proxiedRequest);
    } catch (e) {
      return new Response(`502 Bad Gateway — upstream unreachable: ${upstream}`, {
        status: 502, headers: { 'Content-Type': 'text/plain' }
      });
    }
  },
};
```

```toml
# worker/wrangler.toml
name = "taskflow-router"
main = "index.js"
compatibility_date = "2026-01-01"

[vars]
SHELL_URL      = "https://taskflow-shell.vercel.app"
TASK_MFE_URL   = "https://taskflow-task.vercel.app"
BOARD_MFE_URL  = "https://taskflow-board.vercel.app"
GATEWAY_URL    = "https://taskflow-gateway.up.railway.app"
```

---

## Navigation rules — critical

**Within the same zone** (e.g. `/tasks/1` → `/tasks/2`): use Next.js `<Link>` normally.

**Across zones** (e.g. Tasks → Board): use a plain `<a>` tag — never `<Link>`.
Next.js `<Link>` tries to soft-navigate and fails silently across zones.

```tsx
// ✅ correct — cross-zone navigation
<a href="/board">Go to Board</a>

// ❌ wrong — this will break
<Link href="/board">Go to Board</Link>
```

The shared `NavBar` in `packages/ui` uses `<a>` tags for all links — safe across all zones.

---

## `packages/ui` — shared NavBar

A `'use client'` React component. Uses only `<a>` tags (no `next/link` import) so it
works safely whether rendered in the shell zone or the task zone.

```tsx
// packages/ui/src/NavBar.tsx
'use client';

export function NavBar() {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: '#121215', borderBottom: '1px solid #222227' }}>
      <nav style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ color: '#F4F3F0', fontSize: 18, fontWeight: 600, textDecoration: 'none' }}>Taskflow</a>
        <div style={{ display: 'flex', gap: 24, fontSize: 14 }}>
          <a href="/" style={{ color: '#ABAAA5', textDecoration: 'none' }}>Home</a>
          <a href="/tasks" style={{ color: '#ABAAA5', textDecoration: 'none' }}>Tasks</a>
          <a href="/board" style={{ color: '#ABAAA5', textDecoration: 'none' }}>Board</a>
        </div>
      </nav>
    </header>
  );
}
```

Both shell and mfe-task declare `"@taskflow/ui": "*"` in dependencies and add
`transpilePackages: ['@taskflow/ui']` in `next.config.js`.

---

## Auth — how it works across zones

Same domain = shared cookie. That is the entire solution.

The Shell sets an `httpOnly` cookie on the shared domain.
Every zone (Task MFE, Board MFE) automatically receives that cookie
on every request — no `postMessage`, no `CustomEvent`, no token passing.

For now (Phase 0): no auth cookie yet. Just stub the pattern.

```ts
// shell/src/app/api/auth/route.ts  (stub for later)
export async function POST() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'taskflow_session=stub; Path=/; HttpOnly; SameSite=Lax',
    },
  });
}
```

---

## .env.example

```env
# Shell
TASK_MFE_URL=http://localhost:3003
BOARD_MFE_URL=http://localhost:4200

# Worker (production — fill after Vercel deploy)
SHELL_URL=
GATEWAY_URL=
```

---

## How to run locally — 4 terminals

Each app installs its own `node_modules` independently.

```bash
# Terminal 1
cd shell && npm install && npm run dev          # localhost:3002

# Terminal 2
cd mfe-task && npm install && npm run dev       # localhost:3003

# Terminal 3
cd mfe-board && npm install && npm start        # localhost:4200

# Terminal 4
cd worker && npx wrangler dev --local           # localhost:8787

# Open browser → localhost:8787
```

---

## What each app shows (Phase 0 — placeholder UI only)

Design reference: https://www.figma.com/design/gyXPilu3pWUYYpmt2NwA3b/Task-Management

Design language: dark background `#121215`, indigo accent `#6155DD`, Inter font,
card background `#222227`, primary text `#F4F3F0`.

### Shell (`localhost:8787/`)
- Full page with NavBar at the top
- Links: Home · Tasks · Board
- Body: "Welcome to Taskflow" with a brief description
- Two CTA buttons: "Go to Tasks" and "Go to Board" (both `<a>` tags)

### Task MFE (`localhost:8787/tasks`)
- Same NavBar (from `packages/ui`)
- Body: "Task Management" heading
- Phase label: "Phase 0 · Multi-Zones Foundation"
- Placeholder card: "Tasks coming in Phase 1"

### Board MFE (`localhost:8787/board`)
- Angular component with matching dark theme styles
- "Kanban Board" heading
- Phase label: "Phase 0 · Multi-Zones Foundation"
- Placeholder card: "Board coming in Phase 2"

---

## Definition of done

- [ ] `localhost:8787` opens the Shell home page
- [ ] Clicking "Go to Tasks" navigates to `localhost:8787/tasks` and renders Task MFE
- [ ] Clicking "Go to Board" navigates to `localhost:8787/board` and renders Board MFE
- [ ] The NavBar appears consistently across all three pages
- [ ] All three apps run independently on their own ports
- [ ] No 404s, no broken asset paths, no CORS errors in the console
- [ ] `basePath` and `assetPrefix` are correctly set — no `/_next` asset 404s

---

## What NOT to do

- Do not use `<Link>` for cross-zone navigation — only `<a>` tags
- Do not install `@module-federation/nextjs-mf` — incompatible with App Router
- Do not install `@angular-architects/native-federation` or `ngx-build-plus` — not needed
- Do not add any backend services, API routes (except the auth stub), or database code
- Do not add authentication beyond the stub cookie route above
- Do not add TanStack Query, Zustand, NgRx, or any state management yet
- Do not use Next.js Pages Router — App Router only
- Do not forget `basePath` and `assetPrefix` on Task MFE — assets will 404 without it
- Do not forget `baseHref: '/board/'` on Angular — routing breaks without it
- Do not add npm workspaces to the root — each app owns its own node_modules independently
