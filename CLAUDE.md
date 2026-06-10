# Taskflow — CLAUDE.md

## What we are building right now

Three frontend apps wired together via Module Federation.
That is the only goal. No backend. No API calls. No authentication yet.

**Shell** loads Task MFE and Board MFE as remotes.
Each MFE shows a basic placeholder UI.
All three run simultaneously and compose into one app via the Cloudflare Worker.

---

## Project type

Monorepo using **pnpm workspaces**.

```
taskflow/
├── CLAUDE.md
├── pnpm-workspace.yaml
├── package.json
├── worker/          ← Cloudflare Worker — single entry point router
├── shell/           ← Next.js 14 — MFE Host
├── mfe-task/        ← Next.js 14 — MFE Remote
└── mfe-board/       ← Angular 19 — MFE Remote
```

---

## Exact versions to use

| App | Framework | Version | Reason |
|---|---|---|---|
| shell | Next.js | **14.2.x** | Webpack-based — Module Federation works without issues |
| mfe-task | Next.js | **14.2.x** | Same as shell — must match for shared deps |
| mfe-board | Angular | **19.x** | Latest stable with Native Federation support |
| MF plugin (Next.js) | @module-federation/nextjs-mf | **8.x** | Stable for Next.js 14 |
| MF plugin (Angular) | @angular-architects/module-federation | **^19.0.0** | Matches Angular 19 exactly |

> Do NOT use Next.js 15 or 16. Turbopack (their new default bundler) has
> known issues with @module-federation/nextjs-mf. Next.js 14 is the safe,
> proven choice for Module Federation right now.

---

## Port map

| App | Port | Notes |
|---|---|---|
| Cloudflare Worker | 8787 | `wrangler dev --local` — open this in browser |
| Shell | **3002** | MFE host (3001 is taken by another project) |
| Task MFE | 3003 | MFE remote |
| Board MFE | 4200 | Angular default |

---

## Module Federation config

### Shell — HOST (`shell/next.config.js`)

```js
const { NextFederationPlugin } = require('@module-federation/nextjs-mf');

module.exports = {
  webpack(config, options) {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'shell',
        remotes: {
          taskMfe: `taskMfe@http://localhost:8787/tasks/_next/static/chunks/remoteEntry.js`,
          boardMfe: `boardMfe@http://localhost:8787/board/remoteEntry.js`,
        },
        shared: {},
      })
    );
    return config;
  },
};
```

### Task MFE — REMOTE (`mfe-task/next.config.js`)

```js
const { NextFederationPlugin } = require('@module-federation/nextjs-mf');

module.exports = {
  webpack(config, options) {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'taskMfe',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          './TaskApp': './src/components/TaskApp.tsx',
        },
        shared: {},
      })
    );
    return config;
  },
};
```

### Board MFE — REMOTE (`mfe-board/webpack.config.js`)

```js
const {
  share,
  withModuleFederationPlugin,
} = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'boardMfe',
  filename: 'remoteEntry.js',
  exposes: {
    './BoardApp': './src/app/board/board.component.ts',
  },
  shared: share({
    '@angular/core':    { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    '@angular/common':  { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    '@angular/router':  { singleton: true, strictVersion: true, requiredVersion: 'auto' },
  }),
});
```

---

## How Shell loads remotes

```tsx
// shell/src/app/tasks/page.tsx
import dynamic from 'next/dynamic';

const TaskApp = dynamic(
  () => import('taskMfe/TaskApp').then((m) => m.default),
  { ssr: false, loading: () => <p>Loading tasks...</p> }
);

export default function TasksPage() {
  return <TaskApp />;
}
```

```tsx
// shell/src/app/board/page.tsx
import dynamic from 'next/dynamic';

const BoardApp = dynamic(
  () => import('boardMfe/BoardApp').then((m) => m.BoardComponent),
  { ssr: false, loading: () => <p>Loading board...</p> }
);

export default function BoardPage() {
  return <BoardApp />;
}
```

---

## What each MFE should show (Phase 0 — placeholder only)

### Shell (`localhost:3002`)
- Top navigation bar with links: Dashboard · Tasks · Board
- Sidebar with workspace nav
- Renders the remote MFE in the main content area based on route
- `/` → welcome message
- `/tasks` → loads Task MFE
- `/board` → loads Board MFE

### Task MFE (`localhost:3003`)
- Simple page that says "Task Management — coming soon"
- Shows current phase label: "Phase 0 · MFE Foundation"
- A basic card layout is fine — no real data

### Board MFE (`localhost:4200`)
- Simple Angular component that says "Kanban Board — coming soon"
- Shows current phase label: "Phase 0 · MFE Foundation"
- A basic styled div is fine — no real data

---

## Cloudflare Worker (`worker/index.js`)

```js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    let upstream;
    if (path.startsWith('/api/'))      upstream = env.GATEWAY_URL || 'http://localhost:8080';
    else if (path.startsWith('/board')) upstream = env.BOARD_MFE_URL || 'http://localhost:4200';
    else if (path.startsWith('/tasks')) upstream = env.TASK_MFE_URL  || 'http://localhost:3003';
    else                                upstream = env.SHELL_URL      || 'http://localhost:3002';

    const proxiedUrl = upstream + path + url.search;
    const proxiedRequest = new Request(proxiedUrl, {
      method:  request.method,
      headers: request.headers,
      body:    ['GET','HEAD'].includes(request.method) ? undefined : request.body,
    });

    return fetch(proxiedRequest);
  },
};
```

```toml
# worker/wrangler.toml
name = "taskflow-router"
main = "index.js"
compatibility_date = "2024-01-01"
```

Local dev: `cd worker && npx wrangler dev --local` → `localhost:8787`

---

## pnpm-workspace.yaml

```yaml
packages:
  - 'shell'
  - 'mfe-task'
  - 'mfe-board'
```

---

## How to run everything locally (3 terminals)

```bash
# Terminal 1 — Shell
cd shell && pnpm dev        # localhost:3002

# Terminal 2 — Task MFE
cd mfe-task && pnpm dev     # localhost:3003

# Terminal 3 — Board MFE
cd mfe-board && pnpm start  # localhost:4200

# Terminal 4 — Worker
cd worker && npx wrangler dev --local   # localhost:8787

# Open browser at localhost:8787
```

---

## Auth token contract (wire now, use later)

Even though there is no login yet, set up the event listeners now
so the pattern is in place for Phase 1.

```ts
// shell/src/lib/auth-events.ts
export function dispatchAuthToken(token: string) {
  window.dispatchEvent(new CustomEvent('auth:token', { detail: { token } }));
}
export function dispatchAuthLogout() {
  window.dispatchEvent(new CustomEvent('auth:logout'));
}
```

```ts
// mfe-task/src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    const onToken = (e: Event) => setToken((e as CustomEvent).detail.token);
    const onLogout = () => setToken(null);
    window.addEventListener('auth:token', onToken);
    window.addEventListener('auth:logout', onLogout);
    return () => {
      window.removeEventListener('auth:token', onToken);
      window.removeEventListener('auth:logout', onLogout);
    };
  }, []);
  return { token };
}
```

```ts
// mfe-board/src/app/services/auth-listener.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class AuthListenerService {
  token$ = new BehaviorSubject<string | null>(null);
  constructor() {
    window.addEventListener('auth:token', (e: Event) => {
      this.token$.next((e as CustomEvent).detail.token);
    });
    window.addEventListener('auth:logout', () => {
      this.token$.next(null);
    });
  }
}
```

---

## Design reference

Figma: https://www.figma.com/design/gyXPilu3pWUYYpmt2NwA3b/Task-Management

Design language:
- Background: `#121215` (deep dark)
- Card bg: `#222227`
- Accent: `#6155DD` (indigo)
- Text primary: `#F4F3F0`
- Text secondary: `#ABAA A5`
- Font: Inter

Use this as reference when building the placeholder UI.
Keep it clean — dark background, indigo accent, Inter font.

---

## Rules — what NOT to do

- Do not add any backend code
- Do not add authentication logic beyond the event listener stubs above
- Do not create more pages than listed above
- Do not use Next.js 15 or 16
- Do not use `@angular-architects/native-federation` — use `@angular-architects/module-federation@^19.0.0`
- Do not add Redux, Zustand, or any global state library yet
- Do not add TanStack Query yet
- Do not import from one MFE into another — only Shell imports from MFEs
- Do not skip `ssr: false` on dynamic imports in Shell — Angular MFE cannot SSR

---

## Definition of done for this phase

- [ ] `localhost:8787` opens the Shell
- [ ] Navigating to `localhost:8787/tasks` renders the Task MFE placeholder inside Shell
- [ ] Navigating to `localhost:8787/board` renders the Board MFE placeholder inside Shell
- [ ] All three apps run independently on their own ports
- [ ] Auth event stubs are in place in all three apps
- [ ] No console errors about missing remotes or duplicate React instances