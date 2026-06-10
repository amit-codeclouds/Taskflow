# Shell — Progress Doc

## App Overview

| Key | Value |
|-----|-------|
| Role | Module Federation **HOST** |
| Framework | Next.js 14.2.35 |
| Port | 3002 |
| Entry (browser) | http://localhost:8787 (via Cloudflare Worker proxy) |
| MF Plugin | @module-federation/nextjs-mf@8.8.6 |

---

## Phase 0 — MFE Foundation

**Status: COMPLETE**

### Remotes loaded

| Remote name | URL (via Worker proxy) | Exposed module |
|-------------|------------------------|----------------|
| `taskMfe` | `http://localhost:8787/tasks/_next/static/chunks/remoteEntry.js` | `./TaskApp` |
| `boardMfe` | `http://localhost:8787/board/remoteEntry.js` | `./BoardApp` |

### Implemented files

| File | Description |
|------|-------------|
| `next.config.mjs` | NextFederationPlugin config — declares shell as host, wires both remotes |
| `src/app/layout.tsx` | Root layout: dark theme, loads ShellNav + ShellSidebar, wraps page content |
| `src/app/page.tsx` | Dashboard / home — welcome message, links to /tasks and /board |
| `src/app/tasks/page.tsx` | Dynamically imports `taskMfe/TaskApp` with `ssr: false` |
| `src/app/board/page.tsx` | Dynamically imports `boardMfe/BoardApp` with `ssr: false` |
| `src/components/ShellNav.tsx` | Top nav bar: Taskflow logo, Dashboard/Tasks/Board links, "Dispatch token" + "Logout" buttons, listens to `shell:navigate` custom event |
| `src/components/ShellSidebar.tsx` | Left sidebar: workspace nav with Dashboard/Tasks/Board links |
| `src/lib/auth-events.ts` | `dispatchAuthToken(token)` and `dispatchAuthLogout()` — dispatch custom window events for cross-MFE auth communication |
| `src/remotes.d.ts` | TypeScript module declarations: `taskMfe/TaskApp` and `boardMfe/BoardApp` |

### Design tokens applied

| Token | Value |
|-------|-------|
| Background | `#121215` |
| Card background | `#222227` |
| Accent | `#6155DD` (indigo) |
| Text primary | `#F4F3F0` |
| Text secondary | `#ABAA A5` |
| Font | Inter |

### Definition of done (Phase 0)

- [x] Shell runs on port 3002
- [x] `/tasks` route loads Task MFE via dynamic import
- [x] `/board` route loads Board MFE via dynamic import
- [x] Auth event dispatch stubs in place (`auth-events.ts`)
- [x] Top nav and sidebar rendered in layout
- [x] `ssr: false` on all remote dynamic imports

---

## Phase 1 — Planned

- Real authentication login flow wired to `dispatchAuthToken`
- Shell home dashboard with actual workspace data
- Navigation active state highlighting per current route

---

## Known Issues / Notes

- None at Phase 0 completion.

---

*Last updated: 2026-06-10 — Phase 0 complete*
