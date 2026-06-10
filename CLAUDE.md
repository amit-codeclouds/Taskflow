# Taskflow — Claude Code Context

This file is read automatically by Claude Code at the start of every session.
It contains everything needed to understand this project before writing any code.

---

## What this project is

**Taskflow** is a task management platform built intentionally as a learning project
for microservice and micro-frontend architecture. The goal is not just to ship features —
it is to learn how distributed systems integrate, how independent frontends compose,
and how event-driven patterns decouple services.

**Primary stack:** Next.js · Angular · Node.js · Python · PostgreSQL · Redis
**Author:** Arkabrata Chandra · CodeClouds

---

## Architecture in one paragraph

The frontend is split into three independently deployed apps composed via
**Module Federation**. A **Cloudflare Worker** acts as the single entry point —
it routes by URL path to the correct Vercel-hosted MFE or Railway-hosted API Gateway.
The backend is five microservices, each owning its own PostgreSQL schema, communicating
via direct HTTP in Phases 1–2 and via **Redis Streams** event bus from Phase 3 onwards.

---

## Monorepo structure

```
taskflow/
├── CLAUDE.md                    ← you are here
├── TASKFLOW_ARCHITECTURE.md     ← full reference doc
├── docker-compose.yml           ← local dev (no Nginx)
├── pnpm-workspace.yaml
├── .env.example
│
├── worker/                      ← Cloudflare Worker (replaces Nginx entirely)
│   ├── index.js                 ← route by path: / → shell, /tasks → mfe-task, etc.
│   └── wrangler.toml
│
├── shell/                       ← Next.js 14, MFE HOST, port 3001 local
├── mfe-task/                    ← Next.js 14, MFE REMOTE, port 3002 local
├── mfe-board/                   ← Angular 17, MFE REMOTE, port 4200 local
│
├── api-gateway/                 ← Node.js Express, port 8080
├── service-identity/            ← Node.js Express, port 4001
├── service-task/                ← Node.js Express, port 4002
├── service-board/               ← Python FastAPI, port 4003
├── service-notification/        ← Node.js Express + Socket.io, port 4004
└── service-activity/            ← Python FastAPI, port 4005
```

---

## Port map

| App / Service         | Port  | Notes                          |
|-----------------------|-------|--------------------------------|
| Cloudflare Worker     | 8787  | local via `wrangler dev`       |
| Shell                 | 3001  | MFE host                       |
| Task MFE              | 3002  | MFE remote                     |
| Board MFE             | 4200  | MFE remote (Angular default)   |
| API Gateway           | 8080  | only backend entry point       |
| Identity Service      | 4001  |                                |
| Task Service          | 4002  |                                |
| Board Service         | 4003  |                                |
| Notification Service  | 4004  |                                |
| Activity Service      | 4005  |                                |
| PostgreSQL            | 5432  |                                |
| Redis                 | 6379  |                                |

---

## Phase plan — what exists and what is next

### Phase 0 — MFE Foundation (current)
Wire the entire MFE frame before any features.

**Shell** (`shell/`)
- Module Federation host config in `next.config.js`
- Global nav, sidebar, auth provider, MFE loader with error boundary
- Dispatches JWT via `window.dispatchEvent(new CustomEvent('auth:token', ...))`
- Listens for `shell:navigate` events from MFEs

**Task MFE** (`mfe-task/`)
- Module Federation remote config — exposes `./TaskApp`
- Placeholder page only at this phase
- Listens for `auth:token` event to receive JWT from Shell

**Board MFE** (`mfe-board/`)
- Module Federation remote config — exposes `./BoardApp`
- Placeholder page only at this phase
- Angular `AuthListenerService` listens for `auth:token` event

**Worker** (`worker/`)
- Routes: `/api/*` → Gateway, `/board*` → Board MFE, `/tasks*` → Task MFE, `/` → Shell
- Local: `wrangler dev --local` on port 8787
- Production: deployed to Cloudflare, routes to Vercel URLs

**Goal:** Shell loads both MFEs at `localhost:8787/tasks` and `localhost:8787/board`.
No backend services needed yet.

---

### Phase 1 — Walking skeleton (next)
First real end-to-end request: register → login → create task → update status.

- `service-identity/` — `POST /auth/register`, `POST /auth/login`, JWT issuance
- `service-task/` — `GET /tasks`, `POST /tasks`, `PATCH /tasks/:id/status`
- `api-gateway/` — JWT middleware, routes `/auth/*` and `/tasks/*`
- Task MFE — fill in login page, task list, create task form
- PostgreSQL `identity` and `task` schemas via Prisma ORM

---

### Phase 2 — Board + Kanban (after Phase 1)
- `service-board/` — FastAPI, board/column/card management
- Board MFE — Kanban board with Angular CDK DragDrop, NgRx state
- Board service talks to Task service via HTTP

---

### Phase 3 — Event bus (after Phase 2)
- Add Redis Streams as event bus
- Task service publishes: `task.created`, `task.updated`, `task.status_changed`, `task.assigned`
- Board service subscribes instead of polling
- `service-notification/` — new service, subscribes to events, Socket.io real-time push
- Shell/Task MFE add notification bell, Socket.io client

---

## Module Federation — critical rules

**Shell is the HOST. Task MFE and Board MFE are REMOTES.**

Shell `next.config.js`:
```js
new NextFederationPlugin({
  name: 'shell',
  remotes: {
    taskMfe:  'taskMfe@http://localhost:8787/tasks/_next/static/chunks/remoteEntry.js',
    boardMfe: 'boardMfe@http://localhost:8787/board/remoteEntry.js',
  },
  shared: { react: { singleton: true }, 'react-dom': { singleton: true } },
})
```

Task MFE `next.config.js`:
```js
new NextFederationPlugin({
  name: 'taskMfe',
  filename: 'static/chunks/remoteEntry.js',
  exposes: { './TaskApp': './src/app/TaskApp.tsx' },
  shared: { react: { singleton: true } },
})
```

Board MFE `webpack.config.js`:
```js
new ModuleFederationPlugin({
  name: 'boardMfe',
  filename: 'remoteEntry.js',
  exposes: { './BoardApp': './src/app/board/board.component.ts' },
  shared: share({ '@angular/core': { singleton: true, strictVersion: true } }),
})
```

Shell loads remotes dynamically:
```tsx
// shell/src/app/tasks/page.tsx
const TaskApp = dynamic(() => import('taskMfe/TaskApp'), { ssr: false });
export default function TasksPage() { return <TaskApp />; }
```

---

## Auth contract — how JWT flows between Shell and MFEs

The Shell holds the JWT. MFEs never call the Identity Service directly.

**Shell dispatches token:**
```ts
// shell/src/lib/auth-events.ts
window.dispatchEvent(new CustomEvent('auth:token', { detail: { token } }));
window.dispatchEvent(new CustomEvent('auth:logout'));
```

**MFE receives token (React):**
```ts
// mfe-task/src/hooks/useAuth.ts
useEffect(() => {
  const handler = (e: CustomEvent) => setToken(e.detail.token);
  window.addEventListener('auth:token', handler as EventListener);
  return () => window.removeEventListener('auth:token', handler as EventListener);
}, []);
```

**MFE requests navigation:**
```ts
window.dispatchEvent(new CustomEvent('shell:navigate', { detail: { path: '/board' } }));
```

**Rule:** MFEs never import from each other. Shell imports from MFEs via Module Federation.
MFEs communicate with Shell only via `window` CustomEvents.

---

## Cloudflare Worker — routing logic

```js
// worker/index.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    let upstream;
    if (path.startsWith('/api/'))   upstream = env.GATEWAY_URL;
    else if (path.startsWith('/board')) upstream = env.BOARD_MFE_URL;
    else if (path.startsWith('/tasks')) upstream = env.TASK_MFE_URL;
    else                            upstream = env.SHELL_URL;
    return fetch(new Request(upstream + path + url.search, request));
  }
};
```

Local dev: `cd worker && npx wrangler dev --local` → `localhost:8787`
Production: `npx wrangler deploy`

**No Nginx anywhere in this project. Cloudflare Worker is the only reverse proxy.**

---

## Backend service rules

- **Each service owns its database schema.** Services never read each other's tables.
- **All external traffic goes through the API Gateway** on port 8080. Individual services
  are never exposed publicly — they only accept connections from the gateway or each other
  on the internal Docker network.
- **JWT is validated at the gateway only.** Individual services trust the gateway and do
  not re-validate tokens themselves.
- **Services talk via HTTP in Phases 1–2.** From Phase 3, they publish/subscribe via
  Redis Streams instead of direct HTTP calls where possible.

---

## Database — PostgreSQL schemas

One PostgreSQL cluster, separate schema per service. Never cross schema boundaries.

```
taskflow (database)
├── identity    — users, sessions, groups, group_members
├── task        — tasks, comments, tags, task_tags
├── board       — boards, columns, cards
├── notification — notifications, preferences
└── activity    — events (append-only, never delete)
```

**Task status enum:** `TODO | IN_PROGRESS | IN_REVIEW | DONE | BLOCKED`
**Priority enum:** `LOW | MEDIUM | HIGH | CRITICAL`

Node.js services use **Prisma ORM**. Python services use **SQLAlchemy + asyncpg**.

---

## Event catalog (Phase 3+)

| Event                  | Publisher    | Subscribers                        |
|------------------------|--------------|------------------------------------|
| `task.created`         | Task Service | Board, Activity, Notification      |
| `task.updated`         | Task Service | Board, Activity                    |
| `task.status_changed`  | Task Service | Board, Activity, Notification      |
| `task.assigned`        | Task Service | Activity, Notification             |
| `task.commented`       | Task Service | Activity, Notification             |

Event payload shape:
```json
{
  "eventId": "evt_01J8X...",
  "eventType": "task.status_changed",
  "version": 1,
  "timestamp": "2025-06-14T10:30:00Z",
  "actorId": "usr_01J8...",
  "payload": { "taskId": "tsk_01J8...", "oldStatus": "TODO", "newStatus": "IN_PROGRESS" }
}
```

---

## Tech stack per service

| Service              | Language   | Framework       | ORM / DB client  |
|----------------------|------------|-----------------|------------------|
| Shell                | TypeScript | Next.js 14      | —                |
| Task MFE             | TypeScript | Next.js 14      | TanStack Query   |
| Board MFE            | TypeScript | Angular 17      | NgRx             |
| API Gateway          | TypeScript | Express         | —                |
| Identity Service     | TypeScript | Express         | Prisma           |
| Task Service         | TypeScript | Express         | Prisma           |
| Board Service        | Python     | FastAPI         | SQLAlchemy       |
| Notification Service | TypeScript | Express         | Prisma           |
| Activity Service     | Python     | FastAPI         | SQLAlchemy       |

---

## Local dev — how to run everything

```bash
# Terminal 1 — databases + backend services
docker-compose up

# Terminal 2 — frontends
pnpm --filter shell dev        # localhost:3001
pnpm --filter mfe-task dev     # localhost:3002
pnpm --filter mfe-board start  # localhost:4200

# Terminal 3 — Cloudflare Worker (local emulator)
cd worker && npx wrangler dev --local  # localhost:8787

# Open: localhost:8787
```

---

## Deployment

| Layer      | Platform          | Notes                              |
|------------|-------------------|------------------------------------|
| Router     | Cloudflare Worker | free tier · 100k req/day           |
| Frontends  | Vercel            | free tier · one project per MFE    |
| Backend    | Railway           | free tier · 500 hrs/mo             |
| PostgreSQL | Railway plugin    | managed                            |
| Redis      | Railway plugin    | managed                            |

Deploy order: Vercel (shell, mfe-task, mfe-board) → Railway (services + DB + Redis)
→ paste URLs into `worker/wrangler.toml` → `npx wrangler deploy`

---

## Coding conventions

- **TypeScript strict mode** on all Node.js and Next.js code
- **Zod** for all request validation in Node.js services
- **Pydantic** for all request validation in Python services
- **No `any` types** — if you don't know the type, define an interface
- **Error responses** always use `{ error: string, code?: string }` shape
- **Environment variables** loaded via `dotenv` — never hardcode secrets
- **Each service has its own `.env.example`** — always keep it updated
- **Prisma migrations** committed to git — never edit the database manually
- **Python services** use `async def` throughout — never sync handlers in FastAPI

---

## What NOT to do

- Do not add Nginx anywhere — Cloudflare Worker is the only reverse proxy
- Do not import from one MFE into another — only Shell imports from MFEs
- Do not access another service's database schema directly
- Do not validate JWT in individual services — only the API Gateway does this
- Do not use `localStorage` for the JWT — use the `auth:token` CustomEvent pattern
- Do not add the Activity or Admin MFE yet — those are Phase 4+
- Do not add Kubernetes — that is Phase 5+

---

## Key architectural decisions and why

| Decision | Reason |
|---|---|
| Phase 0 MFE scaffold before features | Building features first then extracting MFEs causes painful refactoring |
| Cloudflare Worker instead of Nginx | Free, edge-deployed, programmable JS vs declarative config, no server to maintain |
| Redis Streams deferred to Phase 3 | Learn HTTP service communication first, add async messaging when the pain of direct calls is felt |
| Separate schema per service, not separate DB | Easier local dev; can split to separate databases in Phase 5 without changing application code |
| Angular for Board MFE, Next.js for Task MFE | Intentional: learn cross-framework MFE composition — the hardest and most valuable MFE skill |
| JWT validated at gateway only | Single responsibility; individual services remain stateless and simpler |
| CustomEvent for auth token | No shared runtime between Next.js and Angular MFEs — window events work across framework boundaries |

---

## Figma design file

URL: https://www.figma.com/design/gyXPilu3pWUYYpmt2NwA3b/Task-Management

Design language: dark neutral theme, single indigo accent `#6155DD`, Inter typeface.
Screens: Login · Dashboard · Kanban Board · Task Detail drawer · Team Management