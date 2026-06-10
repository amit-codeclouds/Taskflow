# mfe-board — Progress Doc

## App Overview

| Key | Value |
|-----|-------|
| Role | Board MFE — standalone Angular app, embedded by Shell via iframe |
| Framework | Angular **17.3.x** (see version note below) |
| Port | 4200 |
| Direct URL | http://localhost:4200 |
| Consumed by Shell as | `<iframe src="http://localhost:4200">` |
| Composition strategy | **iframe** (not Module Federation) |
| Build tool | Angular CLI + ngx-build-plus (custom webpack) |

> **Version note:** `CLAUDE.md` previously specified Angular 19.x. Installed version is Angular **17.3**. Since we are no longer using Module Federation, an Angular 19 upgrade is not required for Phase 0. It can be revisited in a later phase. Do not upgrade unless explicitly planned.

> This app is a fully standalone Angular application. It is NOT a Module Federation remote consumed by the Shell. `webpack.config.js` still contains MF config (from the previous attempt) but it is unused for federation purposes.

---

## Why we moved from Module Federation to iframes

See `shell/docs/PROGRESS.md` for the full account. mfe-board's `webpack.config.js` still exists with MF configuration, but the Shell no longer dynamically imports from it. The Angular app runs standalone and is embedded via `<iframe>`.

---

## Phase 0 — MFE Foundation

**Status: COMPLETE**

### What's working

| Feature | Status |
|---|---|
| Standalone Angular app on port 4200 | COMPLETE |
| `BoardComponent` placeholder UI | COMPLETE |
| `AuthListenerService` — window event listener stub | COMPLETE |
| Design tokens — dark theme, Inter, indigo accent | COMPLETE |
| Routing — empty path → BoardComponent | COMPLETE |

### Implemented files

| File | Description |
|------|-------------|
| `webpack.config.js` | MF config from previous attempt — present but not used for federation |
| `webpack.prod.config.js` | Production webpack config, extends base |
| `src/app/app.component.ts` | Root standalone component with `<router-outlet>` |
| `src/app/app.component.html` | Full-height dark wrapper with `<router-outlet>` |
| `src/app/app.config.ts` | Standalone bootstrap config |
| `src/app/app.routes.ts` | Routes: empty path → `BoardComponent` |
| `src/app/board/board.component.ts` | Placeholder card: "Kanban Board — coming soon", Phase 0 label, auth token status |
| `src/app/services/auth-listener.service.ts` | Injectable service — `token$: BehaviorSubject<string \| null>`, listens to `auth:token` / `auth:logout` |
| `src/bootstrap.ts` | `bootstrapApplication(AppComponent, appConfig)` |
| `src/main.ts` | Imports `bootstrap.ts` |

### Auth service

`AuthListenerService` is injected into `BoardComponent` and exposes `token$` as an RxJS observable. In iframe mode, the Shell's `window.dispatchEvent` does not reach this app's `window`, so `token$` will not emit in Phase 0.

```ts
// board.component.ts
constructor(public auth: AuthListenerService) {}
// template: authListener.token$ | async
```

### Definition of done (Phase 0)

- [x] Board MFE runs standalone on port 4200
- [x] Placeholder UI rendered with Phase 0 label
- [x] `AuthListenerService` wired and listening for auth events
- [x] Starts with `npm run start` (must be PowerShell/cmd — `ng` is a `.cmd` file)

---

## Known Issues / Limitations

- **Auth events not received in iframe.** Shell dispatches on its own `window`; this app's `window` is separate. `token$` will not emit until Phase 1 `postMessage` bridge is added.
- **`webpack.config.js` has unused MF config.** It is retained as-is to avoid breaking the Angular CLI build. Do not remove it without verifying the build still works.
- **Must start from PowerShell or cmd.** Git Bash cannot resolve `ng.cmd`.

---

## Phase 1 — Planned

- Listen for `message` events to receive auth token from Shell via `postMessage`
- Kanban board UI with columns (To Do, In Progress, Done)
- Drag-and-drop card movement between columns
- Authenticated API calls using the received token

---

*Last updated: 2026-06-10 — Migrated from Module Federation to iframe approach*
