# Dashboard Requirements

## Overview

The Dashboard is the first screen a user sees after logging in. It provides a high-level health summary of the workspace — task counts, quick navigation to the two MFE apps, and a project phase timeline.

**Route**: `/` (Shell, Next.js)  
**Component**: `shell/src/components/home/WelcomeScreen.tsx`

---

## User Stories

| # | Story |
|---|---|
| US-DASH-1 | As a logged-in user I can see how many tasks are in each status at a glance |
| US-DASH-2 | As a logged-in user I can navigate to Tasks or Board with one click |
| US-DASH-3 | As a logged-in user I can see the current project phase and what is coming next |
| US-DASH-4 | As a logged-in user the dashboard loads quickly and does not require any interaction to display |

---

## Layout

```
┌─────────────────────────────────────────────────────────┐
│  Sidebar  │              Main Content                    │
│           │  ┌───────────────────────────────────────┐  │
│  Shell    │  │  Welcome back, {name}                  │  │
│  Sidebar  │  │  {workspace name}  ·  {date}           │  │
│           │  └───────────────────────────────────────┘  │
│           │                                             │
│           │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│           │  │Total │ │ In   │ │Done  │ │Board │      │
│           │  │Tasks │ │Progr.│ │      │ │Items │      │
│           │  └──────┘ └──────┘ └──────┘ └──────┘      │
│           │                                             │
│           │  ┌────────────────┐  ┌──────────────────┐  │
│           │  │  Tasks App     │  │  Board App       │  │
│           │  │  preview card  │  │  preview card    │  │
│           │  │  [Open Tasks →]│  │  [Open Board →]  │  │
│           │  └────────────────┘  └──────────────────┘  │
│           │                                             │
│           │  Project Timeline ──────────────────────    │
│           │  [Phase 0] [Phase 1] [Phase 2] [Phase 3]   │
└─────────────────────────────────────────────────────────┘
```

---

## Stat Cards

Four cards, each with an icon, numeric value, and trend label.

| Card | Metric | Source endpoint |
|---|---|---|
| Total Tasks | Count of all tasks in workspace | `GET /api/dashboard/stats` → `totalTasks` |
| In Progress | Tasks with status `in-progress` | `GET /api/dashboard/stats` → `inProgress` |
| Completed | Tasks with status `done` | `GET /api/dashboard/stats` → `completed` |
| Board Items | Active tasks on the team board | `GET /api/dashboard/stats` → `boardItems` |

An optional **Completion Rate** percentage (`completed / totalTasks * 100`) may be shown as a secondary label under the Completed card.

---

## App Preview Cards

Two cards linking to the MFE apps.

### Tasks Card
- Heading: "Task Management"
- Sub-label: lists key capabilities (list view, multi-project, filters)
- CTA button: "Open Tasks" → `<a href="/tasks">` (cross-zone, plain anchor)

### Board Card
- Heading: "Kanban Board"
- Sub-label: lists key capabilities (team-scoped, drag-and-drop, status columns)
- CTA button: "Open Board" → `<a href="/board">` (cross-zone, plain anchor)

**Critical**: both CTAs must be `<a>` tags, NOT `<Link>` — these are cross-zone navigations.

---

## Project Timeline

A horizontal strip showing project phases:

| Phase | Label | Status |
|---|---|---|
| Phase 0 | Multi-Zones Foundation | Completed |
| Phase 1 | Task Management | In Progress (next) |
| Phase 2 | Team Board | Planned |
| Phase 3 | API Integration | Planned |

Visual treatment: completed phases have a filled/active style; upcoming phases are muted.

---

## API Contract

### `GET /api/dashboard/stats`

**Auth**: Required

**Response (200)**
```json
{
  "totalTasks": 142,
  "inProgress": 28,
  "completed": 96,
  "boardItems": 18,
  "completionRate": 67
}
```

---

## Empty State

When the workspace has no tasks yet (brand new workspace):

- Stat cards show `0` with a neutral style (no trend arrows).
- App preview cards still show normally — they are navigational, not data-driven.
- Timeline always shows.

---

## Loading State

- Stat cards show a skeleton/shimmer placeholder while `GET /api/dashboard/stats` is in-flight.
- App preview cards render immediately (no data dependency).

---

## Design Notes

- Background: `#121215`
- Card background: `#222227`
- Accent: `#6155DD`
- Font: Inter
- Welcome message uses the user's first name from the session.
- The date shown is the current local date (e.g. "Thursday, 12 June 2026").
