# Shell — Progress Doc

## App Overview

| Key | Value |
|-----|-------|
| Role | Host app — renders MFEs in iframes |
| Framework | Next.js 14.2.x, App Router |
| Port | 3002 |
| Entry (browser) | http://localhost:8787 (via Cloudflare Worker proxy) |
| Composition strategy | **iframe** (not Module Federation) |

---

## Why we moved from Module Federation to iframes

Module Federation was attempted first. All three plugin paths failed:

| Plugin tried | Blocker |
|---|---|
| `@module-federation/nextjs-mf@8.x` | Hard-blocks App Router — Pages Router only |
| `@module-federation/enhanced/webpack` | Generates MF 2.0 chunks; Next.js produces `/_next/undefined` ChunkLoadError |
| Webpack built-in `ModuleFederationPlugin` | publicPath mismatch — Shell's `/_next/` intercepts mfe-task chunk requests, loading from wrong origin |

iframes give the same runtime isolation with zero bundler complexity. Each MFE is a fully independent app running on its own port. The Shell embeds them as full-height iframes.

---

## Phase 0 — MFE Foundation (iframe)

**Status: IN PROGRESS**

### What's working

| Feature | Status |
|---|---|
| App Router setup (`src/app/`) | COMPLETE |
| Global layout — nav + sidebar in `layout.tsx` | COMPLETE |
| `ShellNav` — top bar, logo, route links, auth buttons | COMPLETE |
| `ShellSidebar` — workspace nav | COMPLETE |
| Dashboard page (`/`) — welcome + route links | COMPLETE |
| Tasks page (`/tasks`) — full-height iframe → `localhost:3003` | COMPLETE |
| Board page (`/board`) — full-height iframe → `localhost:4200` | COMPLETE |
| Auth event dispatch stubs (`lib/auth-events.ts`) | COMPLETE |
| Design tokens — dark theme, Inter, indigo accent | COMPLETE |
| MF plugins removed — plain `next.config.js` | COMPLETE |

### Implemented files

| File | Description |
|------|-------------|
| `next.config.js` | Plain config — no MF plugins, no webpack customisation |
| `src/app/layout.tsx` | Root layout: wraps all pages with `<ShellNav>` and `<ShellSidebar>` |
| `src/app/page.tsx` | Dashboard welcome page |
| `src/app/tasks/page.tsx` | Renders Task MFE in full-height iframe (`NEXT_PUBLIC_TASK_MFE_URL || localhost:3003`) |
| `src/app/board/page.tsx` | Renders Board MFE in full-height iframe (`NEXT_PUBLIC_BOARD_MFE_URL || localhost:4200`) |
| `src/components/ShellNav.tsx` | Top navigation — Taskflow logo, Dashboard/Tasks/Board links, "Dispatch token" + "Logout" buttons |
| `src/components/ShellSidebar.tsx` | Left sidebar workspace nav |
| `src/lib/auth-events.ts` | `dispatchAuthToken(token)` and `dispatchAuthLogout()` — dispatch custom window events |

### Design tokens

| Token | Value |
|-------|-------|
| Background | `#121215` |
| Card background | `#222227` |
| Accent | `#6155DD` (indigo) |
| Text primary | `#F4F3F0` |
| Text secondary | `#ABAAA5` |
| Font | Inter |

### Definition of done (Phase 0)

- [ ] `localhost:8787` opens the Shell
- [x] `/tasks` route renders Task MFE iframe
- [x] `/board` route renders Board MFE iframe
- [x] Auth event stubs in place
- [x] Nav and sidebar in layout

---

## Known Issues / Limitations

- **Auth events don't cross iframe boundaries.** `window.dispatchEvent` fires on the Shell window. Each iframe has its own `window` — MFEs cannot receive these events as currently written. Phase 1 will need `postMessage` to bridge communication.
- **MFE URLs are hardcoded to localhost.** Production requires `NEXT_PUBLIC_TASK_MFE_URL` and `NEXT_PUBLIC_BOARD_MFE_URL` env vars.
- `src/remotes.d.ts` (TypeScript MF module declarations) — no longer needed; safe to delete.

---

## Phase 1 — Planned

- Replace window event bus with `postMessage` cross-iframe messaging
- Real authentication — login page, JWT handling
- Active state highlighting in nav/sidebar per current route
- Dashboard with actual workspace data

---

*Last updated: 2026-06-10 — Migrated from Module Federation to iframe approach*
