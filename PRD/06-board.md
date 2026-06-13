# Board (Team Kanban) Requirements

## Overview

The Board is a Kanban view scoped to **one team at a time**. Statuses on the board are **fully dynamic per team** — each team owns its own list of statuses (no global enum). Tasks belong to a team and to one of that team's statuses.

The Board is an Angular 17 standalone app, served separately at `/board` through the Cloudflare Worker.

**Routes**
- `/board` — team list (landing). One card per team the user belongs to, each with an "Open Kanban" button.
- `/board/:teamId` — Kanban for the selected team.

**Angular base href**: `/board/`
**Components**:
- `mfe-board/src/app/teams/teams-list.component.ts`
- `mfe-board/src/app/board/board.component.ts`

---

## User Stories

| # | Story |
|---|---|
| US-BOARD-1 | As a team member I can see a list of all teams I belong to at `/board` |
| US-BOARD-2 | As a team member I can click "Open Kanban" on a team card to open `/board/:teamId` |
| US-BOARD-3 | As a team member I can switch teams from a topbar dropdown inside the Kanban view |
| US-BOARD-4 | As an authorised role I can add a new status to my team's board ("Add Status" modal) |
| US-BOARD-5 | As an authorised role I can edit or delete an existing status |
| US-BOARD-6 | As a team member I can move a task from one status column to another by drag-and-drop |
| US-BOARD-7 | As a team member I can click "+ Add Task" on a column and be taken to `/tasks/new` pre-filled with that team and status |
| US-BOARD-8 | As a team member I can click an icon on a card to open the task detail page at `/tasks/:id` |
| US-BOARD-9 | As a team member I see only 5 tasks per status by default and can load more |

---

## /board — Team List (landing)

```
┌─────────────────────────────────────────────────────────┐
│  Boards                                                 │
│  ─────────────────────────────────────────────────────  │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │ ● Taskflow Core  │  │ ● Design System  │             │
│  │ 4 members        │  │ 2 members        │             │
│  │ [Open Kanban →]  │  │ [Open Kanban →]  │             │
│  └──────────────────┘  └──────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

Each team card shows: colour dot, name, description, member count, **Open Kanban** button → navigates to `/board/:teamId`.

Data source: `GET /api/teams` (teams the user belongs to).

---

## /board/:teamId — Kanban View

```
┌─────────────────────────────────────────────────────────┐
│  Kanban Board                Team: [Taskflow Core ▾]    │
│                              [+ Add Status]             │
│  ─────────────────────────────────────────────────────  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │ Backlog  (8) │ │ In Prog. (3) │ │ Done    (12) │    │
│  │ ✎  🗑         │ │ ✎  🗑         │ │ ✎  🗑         │    │
│  │ [+ Add Task] │ │ [+ Add Task] │ │ [+ Add Task] │    │
│  │ ┌──────────┐ │ │ ┌──────────┐ │ │ ┌──────────┐ │    │
│  │ │TF-003 ↗  │ │ │ │TF-001 ↗  │ │ │ │TF-007 ↗  │ │    │
│  │ │Auth feat │ │ │ │Nav bug   │ │ │ │Migrate   │ │    │
│  │ └──────────┘ │ │ └──────────┘ │ │ └──────────┘ │    │
│  │ … 5 shown    │ │              │ │              │    │
│  │ [Load more]  │ │              │ │              │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Topbar — team switcher

A dropdown in the **Board MFE topbar** lists every team the user belongs to. Selecting a team navigates to `/board/:newTeamId`. This dropdown only appears inside the Board MFE; Shell pages do not show it.

### Column header

| Element | Description |
|---|---|
| Status name | e.g. "Backlog", "In Progress" |
| Task count | Total tasks in this status |
| Edit (✎) | Open edit modal — same fields as Add Status |
| Delete (🗑) | Confirm dialog → `DELETE /api/board/:teamId/status/:statusId`. Tasks in this status are **soft-deleted** (see Status Deletion below). |
| + Add Task | Navigates to `/tasks/new?teamId=<id>&statusId=<id>` |

### Task card

| Field | Description |
|---|---|
| Task ID | e.g. `TF-003` (top-left muted) |
| Open icon (↗) | Top-right; navigates to `/tasks/:id` |
| Title | Short task title |
| Label badge | feature / bug / design / docs / infra / refactor |
| Priority dot | red (high) / amber (medium) / green (low) |
| Expected completion | Date string. Red if overdue. |
| Assignee avatar | Initials circle |
| Progress % | Small inline progress bar (0–100) |

Drag-and-drop moves a card to another status column.

---

## Add / Edit Status

Clicking **+ Add Status** (or the ✎ icon on a column) opens a modal:

| Field | Type | Required |
|---|---|---|
| Status name | text (max 40) | yes |
| Description | text (max 200) | no |

Submit:
- Add → `POST /api/board/:teamId/statuses`
- Edit → `PATCH /api/board/:teamId/statuses/:statusId`

Status order is preserved by `position` (integer); new statuses append to the end.

### Status Deletion

`DELETE /api/board/:teamId/statuses/:statusId`

- Tasks belonging to the deleted status are **soft-deleted** (`tasks.deleted_at` set; they disappear from all lists but remain in the database).
- Column is removed from the board immediately.
- The last remaining status of a team cannot be deleted (returns `422`).

---

## Drag-and-Drop

1. User drags a card from its current column to another.
2. Card previews in target column while dragging.
3. On drop → `PATCH /api/tasks/:id/status` with `{ statusId }`.
4. Card stays in the new column; column counts update.
5. On API error → snap back, toast.

---

## Pagination per column

Each status returns the first **5 tasks** in `GET /api/board/:teamId`. Each column has a **Load more** button that calls `GET /api/board/:teamId/status/:statusId/tasks?page=2&limit=10`. The "page" continues incrementing as the user clicks Load more.

---

## Permissions on the Board

See `PRD/04-teams.md` for the full role definitions. Summary:

| Action | Admin | PM | TL | Developer |
|---|---|---|---|---|
| Add status | ✅ | ✅ | ❌ | ❌ |
| Edit / delete status | ✅ | ✅ | ✅ | ❌ |
| Create task | ✅ | ✅ | ✅ | ✅ (own only) |
| Edit task (any) | ✅ | ✅ | ✅ | ❌ |
| Edit task (own) | ✅ | ✅ | ✅ | ✅ |
| Move task (drag) | ✅ | ✅ | ✅ | ✅ (own only) |
| Invite members / assign roles | ✅ | ❌ | ❌ | ❌ |

`403` is returned if the role lacks permission.

---

## API Endpoints (overview)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/board/:teamId` | Listing: team → statuses → first 5 tasks each |
| GET | `/api/board/:teamId/status/:statusId/tasks?page&limit` | Load more tasks for one status |
| POST | `/api/board/:teamId/statuses` | Add status |
| PATCH | `/api/board/:teamId/statuses/:statusId` | Edit status |
| DELETE | `/api/board/:teamId/statuses/:statusId` | Delete status (soft-deletes its tasks) |
| PATCH | `/api/tasks/:id/status` | Drag-drop move |

Full request/response shapes live in `APIRequirements/api-endpoints.md`.

---

## Empty States

| Scenario | Message |
|---|---|
| User has no teams | "You're not a member of any team. Ask an admin to add you." |
| Team has no statuses yet | "No statuses yet. Click + Add Status to create your first column." |
| Column has no tasks | Dashed outline with "Add task" link |

---

## Angular Architecture

```
mfe-board/src/app/
├── app.routes.ts                 — '' → TeamsListComponent, ':teamId' → BoardComponent
├── app.component.ts
├── app.config.ts
├── teams/
│   └── teams-list.component.ts   — landing /board
├── board/
│   ├── board.component.ts        — Kanban container, team switcher, statuses
│   ├── column.component.ts       — single status column with cards + load-more
│   ├── task-card.component.ts
│   └── status-modal.component.ts — Add / Edit status modal
└── layout/
    └── topbar.component.ts       — team switcher dropdown (Board MFE only)
```

All components are Angular 17 standalone (no NgModules).

---

## Cross-Zone Navigation

The Board MFE may navigate to `/tasks/new` and `/tasks/:id` (Task MFE) — these are **cross-zone**. Use plain `<a href="...">`, not `[routerLink]`.

```html
<!-- correct: cross-zone -->
<a [href]="'/tasks/' + task.id">Open</a>

<!-- correct: same-zone (board internal) -->
<a [routerLink]="['/board', otherTeamId]">Switch team</a>
```
