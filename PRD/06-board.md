# Board (Team Kanban) Requirements

## Overview

The Board is a Kanban view scoped to **one team at a time**. Unlike the Tasks list (which aggregates across all projects), the Board shows a single team's work in column format so the team can see the current state of all their tasks at once.

The Board is an Angular 17 standalone app, served separately at `/board` through the Cloudflare Worker.

**Route**: `/board` (Board MFE, Angular)  
**Angular base href**: `/board/`  
**Component**: `mfe-board/src/app/board/board.component.ts`

---

## User Stories

| # | Story |
|---|---|
| US-BOARD-1 | As a team member I can see all tasks for my team arranged in status columns |
| US-BOARD-2 | As a team member I can switch which team's board I am viewing |
| US-BOARD-3 | As a team member I can move a task from one column to another by dragging |
| US-BOARD-4 | As a team member I can create a new task from any column |
| US-BOARD-5 | As a team member I can see each task's priority, label, due date, and assignee at a glance |
| US-BOARD-6 | As a team member I can click a task card to see its full details |

---

## Layout

```
┌─────────────────────────────────────────────────────────┐
│  Sidebar  │  Kanban Board          Team: [Taskflow ▾]   │
│           │  Phase 0 · Multi-Zones Foundation           │
│           │  ─────────────────────────────────────────  │
│           │  ┌──────────┐ ┌──────────┐ ┌──────┐ ┌────┐ │
│           │  │ To Do (2)│ │In Prog(2)│ │Rev(1)│ │Done│ │
│           │  │   [+]    │ │   [+]    │ │  [+] │ │[+] │ │
│           │  │ ┌──────┐ │ │ ┌──────┐ │ │      │ │    │ │
│           │  │ │TF-003│ │ │ │TF-001│ │ │      │ │    │ │
│           │  │ │Auth  │ │ │ │NavBug│ │ │      │ │    │ │
│           │  │ │Feat ●│ │ │ │Bug  ●│ │ │      │ │    │ │
│           │  │ │Jun20 │ │ │ │Jun15 │ │ │      │ │    │ │
│           │  │ │ [AC] │ │ │ │ [AC] │ │ │      │ │    │ │
│           │  │ └──────┘ │ │ └──────┘ │ │      │ │    │ │
│           │  │ ┌──────┐ │ │ ┌──────┐ │ │      │ │    │ │
│           │  │ │TF-005│ │ │ │TF-002│ │ │      │ │    │ │
│           │  │ └──────┘ │ │ └──────┘ │ │      │ │    │ │
│           │  └──────────┘ └──────────┘ └──────┘ └────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Columns

The board has exactly four columns, fixed in this order:

| Column ID | Display name | Colour |
|---|---|---|
| `todo` | To Do | Neutral / grey |
| `in-progress` | In Progress | Blue |
| `review` | Review | Purple |
| `done` | Done | Green |

Each column header shows:
- Column name
- Task count in parentheses
- `[+]` add button (creates a task pre-set to that status)

---

## Team Selector

A dropdown in the Topbar lets the user switch which team's board they are viewing.

- Populated from `GET /api/teams` (user's teams only).
- Selecting a team re-fetches `GET /api/board?teamId=<id>`.
- Default: first team the user belongs to (or the last selected, persisted in `user_preferences`).
- If user belongs to only one team, the selector is shown but disabled.

---

## Task Card

Each card on the board shows:

| Field | Description |
|---|---|
| Task ID | e.g. `TF-003` (top-left, muted text) |
| Title | Short task title |
| Label badge | Coloured pill: `feature` / `bug` / `design` / `docs` / `infra` / `refactor` |
| Priority dot | Red (high) · Amber (medium) · Green (low) |
| Due date | Short date string. Red if overdue. |
| Assignee avatar | Initials circle (bottom-right) |

Clicking a card opens the Task Detail drawer (same as in My Tasks).

---

## Drag-and-Drop (Move Task)

1. User drags a card from its current column to another column.
2. Card previews in the new column while dragging.
3. On drop → `PATCH /api/board/move` with `{ taskId, newStatus }`.
4. Card stays in the new column. The task's `status` is updated.
5. Column counts update immediately.

**Rules**:
- Any direction is valid (e.g. Done → To Do is allowed).
- Only one card can be dragged at a time.
- If the API call fails, the card snaps back to its original column and a toast error is shown.

---

## Create Task from Column

1. User clicks `[+]` in a column header.
2. A task creation drawer opens, with the **Status pre-set** to that column's status.
3. User fills in: Title (required), Team (pre-set to the current team), Assignee, Priority, Label, Due Date.
4. Submit → `POST /api/tasks`.
5. New card appears at the bottom of the column immediately.

---

## Sprint Filter (Phase 2)

A secondary dropdown in the Topbar will allow filtering the board by sprint. Initially this shows "All Sprints". When a sprint is selected, only tasks in that sprint appear.

**Query param**: `sprintId=<id>` added to `GET /api/board`.

---

## API Endpoints

### `GET /api/board`

Returns tasks grouped into columns for a given team.

**Auth**: Required

**Query params**:
- `teamId=<id>` (required)
- `sprintId=<id>` (optional)

**Response (200)**
```json
{
  "columns": [
    {
      "id": "todo",
      "title": "To Do",
      "color": "#ABAAA5",
      "tasks": [
        {
          "id": "TF-003",
          "title": "Implement API auth",
          "priority": "high",
          "status": "todo",
          "label": "feature",
          "assigneeId": "u1",
          "assignee": { "id": "u1", "name": "Arkabrata C.", "avatarInitials": "AC" },
          "teamId": "team_1",
          "dueDate": "2026-06-20"
        }
      ]
    },
    {
      "id": "in-progress",
      "title": "In Progress",
      "color": "#5B9CF6",
      "tasks": [ ... ]
    },
    {
      "id": "review",
      "title": "Review",
      "color": "#A78BFA",
      "tasks": []
    },
    {
      "id": "done",
      "title": "Done",
      "color": "#32B173",
      "tasks": []
    }
  ]
}
```

---

### `PATCH /api/board/move`

Move a task to a different column (status change).

**Auth**: Required

**Request**
```json
{
  "taskId": "TF-001",
  "newStatus": "review"
}
```

**Success (200)**
```json
{
  "task": {
    "id": "TF-001",
    "status": "review",
    "updatedAt": "2026-06-12T14:00:00Z"
  }
}
```

**Error (404)**
```json
{ "message": "Task not found" }
```

---

## Empty States

| Scenario | Message |
|---|---|
| Column has no tasks | Dashed card outline with `+` icon and "Add task" text |
| Team has no tasks at all | "This team has no tasks yet. Add your first task." |
| User has no teams | "You're not a member of any team. Ask an admin to add you." |

---

## Angular Architecture

```
mfe-board/src/app/
├── app.routes.ts         — defines route '' → BoardComponent
├── app.component.ts      — root component, mounts BoardComponent
├── app.config.ts         — standalone bootstrap
├── board/
│   └── board.component.ts — main Kanban view with columns + cards
├── layout/
│   ├── sidebar.component.ts — left nav
│   └── topbar.component.ts  — top bar with team selector
└── styles.scss           — global dark theme styles
```

All Angular components are standalone (no NgModules).

---

## Cross-Zone Navigation

All Sidebar links from the Board MFE that point outside `/board` must use plain HTML `<a>` tags:

```html
<!-- Correct -->
<a href="/tasks">My Tasks</a>
<a href="/">Home</a>

<!-- Wrong -->
<a [routerLink]="['/tasks']">My Tasks</a>
```

Internal board routes (if any are added) can use Angular Router `[routerLink]`.

---

## Design Notes

- Columns have a fixed width, horizontally scrollable if the viewport is narrow.
- Cards use a drag handle or are fully draggable.
- Card placeholder appears in the target column while dragging.
- The team selector dropdown matches the shell sidebar's visual style.
- Angular component inline styles use the same `#121215` / `#222227` / `#6155DD` palette.
