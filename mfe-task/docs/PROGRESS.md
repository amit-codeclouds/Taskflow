# mfe-task — Progress Doc

## App Overview

| Key | Value |
|-----|-------|
| Role | Module Federation **REMOTE** |
| Framework | Next.js 14.2.35 |
| Port | 3003 |
| Direct URL | http://localhost:3003 |
| Proxied via Worker | http://localhost:8787/tasks/* |
| MF Plugin | @module-federation/nextjs-mf@8.8.6 |

---

## Phase 0 — MFE Foundation

**Status: COMPLETE**

### Exposed modules

| Export key | Source file | Consumed by |
|------------|-------------|-------------|
| `./TaskApp` | `src/components/TaskApp.tsx` | Shell `/tasks` page |

### Implemented files

| File | Description |
|------|-------------|
| `next.config.mjs` | NextFederationPlugin config — name: `taskMfe`, exposes `./TaskApp`, filename: `static/chunks/remoteEntry.js` |
| `src/components/TaskApp.tsx` | Placeholder UI: "Task Management — coming soon", Phase 0 label, auth token status badge |
| `src/hooks/useAuth.ts` | React hook — listens to `auth:token` and `auth:logout` window events, returns `{ token: string \| null }`, cleans up listeners on unmount |
| `src/app/page.tsx` | Standalone page for direct access at localhost:3003 |
| `src/app/layout.tsx` | App layout with dark theme globals |

### Auth integration

`useAuth` hook is consumed inside `TaskApp.tsx` to display whether a token has been received from the shell. This is a stub — no actual API calls use the token yet.

```ts
const { token } = useAuth();
// token is null until shell dispatches auth:token event
```

### Definition of done (Phase 0)

- [x] Task MFE runs on port 3003
- [x] `./TaskApp` exposed and consumable by Shell
- [x] Placeholder UI rendered with Phase 0 label
- [x] `useAuth` hook wired and listening for auth events

---

## Phase 1 — Planned

- Task list UI with real task data (fetched using token from `useAuth`)
- Create / edit / delete task interactions
- Task filtering and sorting

---

## Known Issues / Notes

- None at Phase 0 completion.

---

*Last updated: 2026-06-10 — Phase 0 complete*
