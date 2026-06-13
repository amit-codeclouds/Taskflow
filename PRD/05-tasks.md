# Tasks (My Tasks List) Requirements

## Overview

The Tasks screen is a personal task inbox. It shows every task assigned to the logged-in user, aggregated across **all projects and all teams** they belong to. This is NOT a single project view — it is a cross-project list so a user can see everything they need to work on in one place.

**Route**: `/tasks` (Task MFE, Next.js)  
**Base path**: `/tasks` (basePath + assetPrefix)  
**Component**: `mfe-task/src/components/tasks/TaskListScreen.tsx`

---

## User Stories

| # | Story |
|---|---|
| US-TASK-1 | As a user I can see all tasks assigned to me, regardless of which project or team they belong to |
| US-TASK-2 | As a user I can filter my tasks by status (All / In Progress / Review / To Do / Done) |
| US-TASK-3 | As a user I can filter my tasks by a specific team |
| US-TASK-4 | As a user I can see how many tasks I have in each status at a glance |
| US-TASK-5 | As a user I can create a new task from this screen |
| US-TASK-6 | As a user I can click a task to see its full details |
| US-TASK-7 | As a user I can update a task's status directly from the list |

---

## Layout

```
┌─────────────────────────────────────────────────────────┐
│  Sidebar  │  Task Management                            │
│           │  Phase 0 · Multi-Zones Foundation           │
│           │  ─────────────────────────────────────────  │
│           │  ┌────────┐ ┌──────────┐ ┌───────┐ ┌─────┐ │
│           │  │ Total  │ │In Progr. │ │In Rev.│ │Done │ │
│           │  │   7    │ │    2     │ │   2   │ │  1  │ │
│           │  └────────┘ └──────────┘ └───────┘ └─────┘ │
│           │                                             │
│           │  [All][In Progress][Review][To Do][Done]    │
│           │  Team: [All Teams ▾]                        │
│           │                                  [New Task] │
│           │  ─────────────────────────────────────────  │
│           │  ID     Title       Label  Pri  Due   Status│
│           │  TF-001 Fix nav bug  Bug   ●    Jun 15 In.. │
│           │  TF-002 Design tok.  Des   ●    Jun 18 Rev. │
│           │  TF-003 API auth     Feat  ●    Jun 20 Todo │
│           │  ...                                        │
└─────────────────────────────────────────────────────────┘
```

---

## Stat Cards

Four cards at the top of the screen, always visible regardless of the active filter.

| Card | Metric | API field |
|---|---|---|
| Total | Total tasks assigned to current user | `total` |
| In Progress | Tasks with status `in-progress` | `inProgress` |
| In Review | Tasks with status `review` | `review` |
| Done | Tasks with status `done` | `done` |

Stats are fetched from `GET /api/tasks/stats?assigneeId=me`.

---

## Filter Tabs

Tabs filter the task list below. Selecting a tab adds `status=<value>` to the API query.

| Tab | Status filter |
|---|---|
| All | (none — return all) |
| In Progress | `in-progress` |
| Review | `review` |
| To Do | `todo` |
| Done | `done` |

---

## Team Filter Dropdown

A dropdown listing all teams the user belongs to, plus "All Teams" at the top.

- Selecting a team adds `teamId=<id>` to the API query.
- The dropdown is populated from `GET /api/teams` (user's teams only).
- Default: "All Teams" (no filter).

---

## Task Row

Each row in the list shows:

| Column | Description |
|---|---|
| ID | Task identifier (e.g. `TF-001`) |
| Title | Short task title |
| Label | Coloured badge: `feature` / `bug` / `design` / `docs` / `infra` / `refactor` |
| Priority | Coloured dot: red (high) · amber (medium) · green (low) |
| Due Date | Formatted date string. Red if overdue. |
| Team | Team name badge (so user knows which context) |
| Status | Status pill: `Todo` · `In Progress` · `Review` · `Done` |

Clicking a row opens the Task Detail drawer.

---

## Task Detail Drawer (Phase 1)

Slides in from the right when a row is clicked. Shows:

- Full title (editable)
- Description (markdown, editable)
- Status selector (dropdown)
- Priority selector
- Label selector
- Assignee picker (shows workspace members)
- Team picker
- Due date picker
- Comments section
- Activity / history timeline

All changes auto-save via `PATCH /api/tasks/:id`.

---

## Create Task Flow

1. Click **"New Task"** button.
2. A drawer/modal opens with:
   - Title (required)
   - Description (optional)
   - Team (required — dropdown of user's teams)
   - Assignee (optional — defaults to current user)
   - Priority (defaults to `medium`)
   - Label (optional)
   - Due Date (optional)
3. Submit → `POST /api/tasks`.
4. New task appears at the top of the list.

---

## Sorting

Default sort: **Due date ascending** (soonest first).  
Secondary sort: **Priority descending** (high before medium before low).

Future: user-sortable columns (click column header to sort).

---

## Pagination

- Default page size: 20 tasks.
- Infinite scroll or "Load more" button at the bottom.
- Query params: `page=1&limit=20`.

---

## Empty States

| Scenario | Message |
|---|---|
| No tasks at all | "You have no tasks yet. Create your first task to get started." |
| Active filter returns nothing | "No tasks match this filter." + "Clear filters" link |
| No tasks in a specific team | "This team has no tasks assigned to you." |

---

## API Endpoints

### `GET /api/tasks`

**Auth**: Required

**Query params**:
- `assigneeId=me` — always present (returns only current user's tasks)
- `status=todo|in-progress|review|done` — from filter tab
- `teamId=<id>` — from team dropdown
- `page=1&limit=20`

**Response (200)**
```json
{
  "tasks": [
    {
      "id": "TF-001",
      "title": "Fix navigation bug on mobile",
      "priority": "high",
      "status": "in-progress",
      "label": "bug",
      "assigneeId": "u1",
      "teamId": "team_1",
      "dueDate": "2026-06-15",
      "createdAt": "2026-06-03T00:00:00Z",
      "updatedAt": "2026-06-10T00:00:00Z"
    }
  ],
  "total": 7,
  "page": 1,
  "limit": 20
}
```

---

### `GET /api/tasks/stats`

**Query params**: `assigneeId=me`

**Response (200)**
```json
{
  "total": 7,
  "todo": 2,
  "inProgress": 2,
  "review": 2,
  "done": 1
}
```

---

### `POST /api/tasks`

**Request**
```json
{
  "title": "New task",
  "priority": "medium",
  "status": "todo",
  "label": "feature",
  "teamId": "team_1",
  "assigneeId": "u1",
  "dueDate": "2026-06-30"
}
```

**Success (201)**
```json
{ "task": { "id": "TF-008", ... } }
```

---

### `PATCH /api/tasks/:id`

Partial update. Any field except `id` and `createdAt`.

---

### `DELETE /api/tasks/:id`

**Success (200)**
```json
{ "ok": true }
```

---

## Label Reference

| Value | Display | Colour |
|---|---|---|
| `feature` | Feature | Indigo |
| `bug` | Bug | Red |
| `design` | Design | Purple |
| `docs` | Docs | Cyan |
| `infra` | Infra | Orange |
| `refactor` | Refactor | Green |

---

## Priority Reference

| Value | Display | Indicator |
|---|---|---|
| `high` | High | Red dot |
| `medium` | Medium | Amber dot |
| `low` | Low | Green dot |

---

## Status Reference

| Value | Display |
|---|---|
| `todo` | To Do |
| `in-progress` | In Progress |
| `review` | Review |
| `done` | Done |

---

## Cross-Zone Note

The Task MFE is served at `localhost:8787/tasks` (through the Worker).  
The Sidebar's "Board" link uses `<a href="/board">` — NOT `<Link>` — because it crosses into the Board MFE zone.
