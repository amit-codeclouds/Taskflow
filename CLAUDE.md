# Taskflow — CLAUDE.md

## What we are building right now

Three frontend apps composed into one via **iframes** — not Module Federation.

The Shell (Next.js) renders each MFE inside a full-viewport `<iframe>`. The Cloudflare Worker sits in front and acts as the single entry point, proxying all traffic through `localhost:8787`.

> **Why we moved away from Module Federation:**
> We attempted Module Federation with Next.js 14 (App Router) using three different plugin strategies:
> - `@module-federation/nextjs-mf` — hard-blocks App Router; only works with Pages Router
> - `@module-federation/enhanced/webpack` — generates MF 2.0 chunk format; produces `/_next/undefined` ChunkLoadError in Next.js
> - webpack's built-in `ModuleFederationPlugin` — publicPath mismatch: shell's `/_next/` prefix intercepts mfe-task asset requests, so chunks load from the wrong origin
>
> Every path hit a different hard blocker. The iframe approach delivers the same isolation guarantee with zero bundler complexity, and unblocks forward progress on Phase 0.

---

## Project type

Monorepo using **npm workspaces**.

```
taskflow/
├── CLAUDE.md
├── package.json
├── worker/          ← Cloudflare Worker — reverse proxy / single entry point
├── shell/           ← Next.js 14 — host app (renders MFEs in iframes)
├── mfe-task/        ← Next.js 14 — Task MFE (standalone app)
└── mfe-board/       ← Angular 17 — Board MFE (standalone app)
```

---

## Exact versions in use

| App | Framework | Version | Notes |
|---|---|---|---|
| shell | Next.js | **14.2.x** | App Router, no MF plugin |
| mfe-task | Next.js | **14.2.x** | App Router, no MF plugin, standalone |
| mfe-board | Angular | **17.3.x** | Standalone components, has webpack.config.js but NOT federated |
| worker | Cloudflare Workers | — | wrangler dev --local |

> Do NOT introduce `@module-federation/nextjs-mf`, `@module-federation/enhanced`, or Next.js 15/16.
> These were all tried and blocked. Keep the configs clean.

---

## Port map

| App | Port | Notes |
|---|---|---|
| Cloudflare Worker | 8787 | Single entry point — open this in browser |
| Shell | **3002** | Next.js host, serves nav + sidebar + iframe wrapper |
| Task MFE | 3003 | Standalone Next.js app |
| Board MFE | 4200 | Standalone Angular app |

---

## How composition works (iframe approach)

The Shell owns the layout (nav + sidebar). Each route renders a full-height iframe pointing directly at the MFE's origin — **not** through the worker.

```
Browser → localhost:8787
               ↓
           Worker proxy
               ↓ (everything except /api)
       Shell (localhost:3002)
       ┌──────────────────────────┐
       │  ShellNav + ShellSidebar │
       │                          │
       │  /tasks  →  <iframe      │
       │    src="localhost:3003"> │
       │                          │
       │  /board  →  <iframe      │
       │    src="localhost:4200"> │
       └──────────────────────────┘
```

### Shell tasks page (`shell/src/app/tasks/page.tsx`)

```tsx
export default function TasksPage() {
  const src = process.env.NEXT_PUBLIC_TASK_MFE_URL || 'http://localhost:3003';
  return (
    <iframe
      src={src}
      style={{ width: '100%', height: 'calc(100vh - 65px)', border: 'none', display: 'block' }}
      title="Task Management"
    />
  );
}
```

### Shell board page (`shell/src/app/board/page.tsx`)

```tsx
export default function BoardPage() {
  const src = process.env.NEXT_PUBLIC_BOARD_MFE_URL || 'http://localhost:4200';
  return (
    <iframe
      src={src}
      style={{ width: '100%', height: 'calc(100vh - 65px)', border: 'none', display: 'block' }}
      title="Kanban Board"
    />
  );
}
```

---

## Shell layout

Shell has a persistent top nav and left sidebar across all routes. The main area is where iframes render.

- `shell/src/app/layout.tsx` — wraps every page with `<ShellNav />` + `<ShellSidebar />`
- `shell/src/components/ShellNav.tsx` — top bar: Taskflow logo, Dashboard / Tasks / Board links, auth dispatch buttons
- `shell/src/components/ShellSidebar.tsx` — left sidebar: workspace nav links
- `shell/src/app/page.tsx` — dashboard welcome screen (no iframe, plain content)
- `shell/src/app/tasks/page.tsx` — Task MFE iframe
- `shell/src/app/board/page.tsx` — Board MFE iframe

Shell `next.config.js` is plain — no plugins, no webpack customisation.

---

## MFE apps

### Task MFE (`mfe-task/`)

Standalone Next.js 14 app with App Router. No MF config.

- `src/app/layout.tsx` — minimal layout (no nav, just body wrapper)
- `src/app/page.tsx` — renders `<TaskApp />`
- `src/components/TaskApp.tsx` — placeholder UI card ("Task Management — coming soon")
- `src/hooks/useAuth.ts` — listens for `auth:token` / `auth:logout` window events

`mfe-task/next.config.js` is plain — no plugins.

### Board MFE (`mfe-board/`)

Standalone Angular 17 app.

- `src/app/app.component.ts` — root component with `<router-outlet>`
- `src/app/app.routes.ts` — single route `''` → `BoardComponent`
- `src/app/board/board.component.ts` — placeholder UI card ("Kanban Board — coming soon")
- `src/app/services/auth-listener.service.ts` — listens for `auth:token` / `auth:logout` window events
- `webpack.config.js` — still present (from the MF attempt), but not used for federation; Angular uses it via `ngx-build-plus` for custom webpack

---

## Cloudflare Worker (`worker/index.js`)

Minimal reverse proxy with two routing branches and error handling.

```js
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
```

| Request path | Forwarded to | Who handles it |
|---|---|---|
| `/api/...` | `env.GATEWAY_URL` (port 8080) | Future backend |
| everything else | `env.SHELL_URL` (port 3002) | Shell (Next.js) |

> The worker does NOT proxy `/tasks` or `/board` to the MFE servers.
> The shell's iframes point directly to `localhost:3003` and `localhost:4200`.
> There is no need to route MFE assets through the worker.

`worker/wrangler.toml`:
```toml
name = "taskflow-router"
main = "index.js"
compatibility_date = "2024-01-01"
```

---

## Auth event contract

Auth events use `window.dispatchEvent` / `window.addEventListener`. This is wired up and works within each app's own window context.

**Important limitation with iframes:** `window.dispatchEvent` in the Shell fires on the Shell's `window`. Iframes have their own `window` — events dispatched in the Shell do **not** propagate into iframe windows automatically. The current stubs are in place as the contract shape, but cross-iframe communication will require `postMessage` in Phase 1 when real auth is added.

### Shell dispatches (`shell/src/lib/auth-events.ts`)

```ts
export function dispatchAuthToken(token: string) {
  window.dispatchEvent(new CustomEvent('auth:token', { detail: { token } }));
}
export function dispatchAuthLogout() {
  window.dispatchEvent(new CustomEvent('auth:logout'));
}
```

### Task MFE listens (`mfe-task/src/hooks/useAuth.ts`)

```ts
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

### Board MFE listens (`mfe-board/src/app/services/auth-listener.service.ts`)

```ts
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

Design language applied across all apps:
- Background: `#121215` (deep dark)
- Card bg: `#222227`
- Accent: `#6155DD` (indigo)
- Text primary: `#F4F3F0`
- Text secondary: `#ABAAA5`
- Font: Inter

---

## How to run locally (4 terminals)

```bash
# Terminal 1 — Shell
cd shell && npm run dev        # localhost:3002

# Terminal 2 — Task MFE
cd mfe-task && npm run dev     # localhost:3003

# Terminal 3 — Board MFE (PowerShell / cmd only — ng is a .cmd file)
cd mfe-board && npm run start  # localhost:4200

# Terminal 4 — Worker
cd worker && npx wrangler dev --local   # localhost:8787

# Open browser at localhost:8787
```

> Board MFE (`npm run start`) must be run from PowerShell or cmd.
> It will not work from Git Bash because `ng` is a `.cmd` file.

---

## Progress Documentation Rule

Every code change — new feature, bug fix, refactor, config update, or dependency change — **MUST** include an update to the `docs/PROGRESS.md` inside the affected app folder(s).

Update the relevant section(s):
- Mark features as **COMPLETE** / **IN PROGRESS** / **PLANNED**
- Add new files to the implemented files table when created
- Update "What's next" / Phase sections when a phase advances
- Note any version drift, known issues, or blockers discovered

This rule applies to all four apps: `shell`, `mfe-task`, `mfe-board`, `worker`.

No change is considered done until its `docs/PROGRESS.md` reflects the new state.

---

## Rules — what NOT to do

- Do not add any backend code
- Do not add authentication logic beyond the event listener stubs above
- Do not create more pages than listed above
- Do not use Next.js 15 or 16
- Do not introduce `@module-federation/nextjs-mf` — hard-blocks App Router
- Do not introduce `@module-federation/enhanced` — produces undefined chunk filenames
- Do not add Redux, Zustand, or any global state library yet
- Do not add TanStack Query yet
- Do not use `ssr: false` dynamic imports for MFEs — we use iframes, not dynamic federation imports
- Do not route MFE asset requests through the worker — iframes load direct from MFE origins

---

## Definition of done for this phase

- [ ] `localhost:8787` opens the Shell
- [ ] Navigating to `localhost:8787/tasks` renders the Task MFE inside a Shell iframe
- [ ] Navigating to `localhost:8787/board` renders the Board MFE inside a Shell iframe
- [ ] All three apps run independently on their own ports
- [ ] Auth event stubs are in place in all three apps
- [ ] Worker returns a 502 with a helpful message if any upstream is unreachable
