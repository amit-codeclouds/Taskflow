# mfe-task — Progress Doc

## App Overview

| Key | Value |
|-----|-------|
| Role | Task MFE — standalone Next.js app, embedded by Shell via iframe |
| Framework | Next.js 14.2.x, App Router |
| Port | 3003 |
| Direct URL | http://localhost:3003 |
| Consumed by Shell as | `<iframe src="http://localhost:3003">` |
| Composition strategy | **iframe** (not Module Federation) |

> This app is a fully standalone Next.js application. It is NOT a Module Federation remote.
> The Shell embeds it via an `<iframe>` — no `remoteEntry.js`, no `NextFederationPlugin`.

---

## Why we moved from Module Federation to iframes

See `shell/docs/PROGRESS.md` for the full account. In short: every MF plugin strategy tried with Next.js 14 App Router hit a hard blocker. This app's `next.config.js` is now clean — no MF plugins, no webpack customisation.

---

## Phase 0 — MFE Foundation

**Status: COMPLETE**

### What's working

| Feature | Status |
|---|---|
| App Router setup (`src/app/`) | COMPLETE |
| Standalone page at `localhost:3003` | COMPLETE |
| `TaskApp` placeholder UI component | COMPLETE |
| `useAuth` hook — window event listener stub | COMPLETE |
| Design tokens — dark theme, Inter, indigo accent | COMPLETE |
| MF plugin removed — plain `next.config.js` | COMPLETE |

### Implemented files

| File | Description |
|------|-------------|
| `next.config.js` | Plain config — no MF plugins |
| `src/app/layout.tsx` | Minimal root layout (no nav — Shell provides chrome) |
| `src/app/page.tsx` | Renders `<TaskApp />` |
| `src/components/TaskApp.tsx` | Placeholder card: "Task Management — coming soon", Phase 0 label, auth token status |
| `src/hooks/useAuth.ts` | Listens for `auth:token` / `auth:logout` on `window`, returns `{ token: string \| null }` |

### Auth hook

`useAuth` is wired but the auth token will **not** be received from the Shell in iframe mode (events don't cross `window` boundaries). The hook is in place as the contract for Phase 1, when the Shell will use `postMessage`.

```ts
const { token } = useAuth();
// token stays null until Phase 1 postMessage bridge is added
```

### Definition of done (Phase 0)

- [x] Task MFE runs standalone on port 3003
- [x] Placeholder UI rendered with Phase 0 label
- [x] `useAuth` hook in place
- [x] Plain `next.config.js` — no MF artifacts

---

## Known Issues / Limitations

- **Auth events not received in iframe.** Shell dispatches on its own `window`; this app's `window` (inside the iframe) is separate. `token` will always be null until `postMessage` is implemented in Phase 1.
- Old `remoteEntry.js` artifact docs can be disregarded — no remote entry is generated or expected.

---

## Phase 1 — Planned

- Listen for `message` events (`window.addEventListener('message', ...)`) to receive token from Shell via `postMessage`
- Task list UI with real data fetched using the auth token
- Create / edit / delete task interactions

---

*Last updated: 2026-06-10 — Migrated from Module Federation to iframe approach*
