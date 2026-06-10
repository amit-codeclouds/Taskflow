# mfe-board — Progress Doc

## App Overview

| Key | Value |
|-----|-------|
| Role | Module Federation **REMOTE** |
| Framework | Angular 17.3 (see version note below) |
| Port | 4200 |
| Direct URL | http://localhost:4200 |
| Proxied via Worker | http://localhost:8787/board/* |
| MF Plugin | @angular-architects/module-federation@17.0.8 |
| Build tool | ngx-build-plus (custom webpack via webpack.config.js) |

> **Version drift note:** `CLAUDE.md` specifies Angular **19.x** and `@angular-architects/module-federation@^19.0.0`, but the installed versions are Angular **17.3** and plugin **17.0.8**. An upgrade to Angular 19 is a pending task before Phase 1 development starts.

---

## Phase 0 — MFE Foundation

**Status: COMPLETE**

### Exposed modules

| Export key | Source file | Consumed by |
|------------|-------------|-------------|
| `./BoardApp` | `src/app/board/board.component.ts` | Shell `/board` page |

### Implemented files

| File | Description |
|------|-------------|
| `webpack.config.js` | Module Federation config — name: `boardMfe`, exposes `./BoardApp`, shares Angular core/common/router as singletons |
| `webpack.prod.config.js` | Production webpack config, extends base |
| `src/app/board/board.component.ts` | Standalone Angular component — placeholder "Kanban Board — coming soon", Phase 0 label, subscribes to `token$` for auth status display |
| `src/app/services/auth-listener.service.ts` | Injectable service — `token$: BehaviorSubject<string \| null>`, listens to `auth:token` and `auth:logout` window events |
| `src/app/app.component.ts` | Root component with `<router-outlet>` |
| `src/app/app.config.ts` | Angular app config (standalone bootstrap) |
| `src/app/app.routes.ts` | Routes: empty path → BoardComponent |
| `src/bootstrap.ts` | Async bootstrap entry (required for Module Federation) |
| `src/main.ts` | Imports bootstrap.ts |

### Auth integration

`AuthListenerService` is injected into `BoardComponent` and exposes `token$` as an RxJS observable. Component subscribes to display auth status.

```ts
// board.component.ts
constructor(private authListener: AuthListenerService) {}
// template uses authListener.token$ | async
```

### Definition of done (Phase 0)

- [x] Board MFE runs on port 4200
- [x] `./BoardApp` exposed and consumable by Shell
- [x] Placeholder UI rendered with Phase 0 label
- [x] `AuthListenerService` wired and listening for auth events

---

## Phase 1 — Planned

- Upgrade Angular 17.3 → 19.x and plugin to @angular-architects/module-federation@^19.0.0
- Kanban board UI with columns (To Do, In Progress, Done)
- Drag-and-drop card movement between columns
- Subscribe to `token$` for authenticated API calls

---

## Known Issues / Notes

- **Angular version mismatch**: installed 17.3, spec requires 19.x. Must upgrade before Phase 1. Check CLAUDE.md for exact target versions before upgrading.

---

*Last updated: 2026-06-10 — Phase 0 complete*
