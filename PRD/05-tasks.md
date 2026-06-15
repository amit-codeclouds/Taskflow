# Tasks (My Tasks List) Requirements

## Overview

The Tasks screen is a personal task inbox. It shows every task assigned to the logged-in user, aggregated across **all projects and all teams** they belong to. This is NOT a single project view — it is a cross-project list so a user can see everything they need to work on in one place.

**Routes**
- `/tasks` — list view
- `/tasks/new` — create task form (also reached from Board column "+ Add Task" with `?teamId=&statusId=` prefill)
- `/tasks/:id` — task detail page (also reached from Board task card "↗" icon)
- `/tasks/:id/edit` — edit task form (same layout as `/tasks/new` but pre-filled; reached from the permanent ✏ icon on list rows or the "Edit Task" button on detail page)

**Base path**: `/tasks` (basePath + assetPrefix)
**Components**:
- `mfe-task/src/components/tasks/TaskListScreen.tsx`
- `mfe-task/src/components/tasks/TaskFormScreen.tsx` (used by `/tasks/new` and edit)
- `mfe-task/src/components/tasks/TaskDetailScreen.tsx`

> **Note on `expectedCompletion`**: throughout this document and the API the date a task is expected to be completed is the field **`expectedCompletion`**. This replaces the older `expectedCompletion` name — same field, renamed.

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
| US-TASK-7 | As a user I can open a task's edit form directly from the list via the permanent ✏ icon |
| US-TASK-8 | As a user I can open a task's detail page directly from the list via the permanent ↗ icon |

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
| Priority dot | Coloured dot: red (high) · amber (medium) · green (low) |
| Title | Short task title — click to navigate to `/tasks/:id` |
| Label | Coloured badge: `feature` / `bug` / `design` / `docs` / `infra` / `refactor` |
| Team | Team name badge |
| Status | Status pill |
| Due Date | Formatted date string |
| Assignee | Avatar with initials |
| ✏ Edit icon | Permanently visible — navigates to `/tasks/:id/edit` — tooltip: "Edit task" |
| ↗ Open icon | Permanently visible — navigates to `/tasks/:id` — tooltip: "Open task" |

Both action icons are always visible (not hover-gated). Tooltips are pure CSS via `data-tooltip` attribute — no JS library. There is no row checkbox.

---

## Task Detail Page (`/tasks/:id`)

Navigated to from the Board card "↗" icon or by clicking a row in the list. A full-page detail view (not a drawer). Shows and allows editing of:

- Title
- Description (rich-text editor)
- Status (team-scoped dropdown — see `/tasks/new`)
- Priority / Label / Team / Assignee
- Expected completion (date)
- Progress % (0–100)
- Images (Cloudinary URLs; add or remove)
- Comments section
- Activity / history timeline

All changes auto-save via `PATCH /api/tasks/:id`.

---

## Create Task Flow (`/tasks/new`)

Clicking **"New Task"** (or "+ Add Task" on a Board column) navigates to `/tasks/new`. When the source is a Board column, the URL carries `?teamId=<id>&statusId=<id>` so those fields are pre-filled and locked.

The form fields (existing fields are kept; new fields added per the latest requirements):

| Field | Type | Required | Notes |
|---|---|---|---|
| Title | text | yes | max 200 chars |
| Description | rich-text editor | no | CKEditor 5 (dark theme); bold/italic/headings/lists/alignment/blockquote/code/image upload (base64 stub → Cloudinary); HTML output |
| Team | dropdown of user's teams | yes | pre-filled from query string if present |
| Status | dropdown of the selected team's statuses | yes | pre-filled from query string if present; dynamic per team — fetched from `GET /api/board/:teamId/statuses` |
| Assignees | multi-select user picker (team members) | no | supports multiple assignees; stored as `assigneeIds: string[]` |
| Priority | high / medium / low | no | defaults to `medium` |
| Label | feature / bug / design / docs / infra / refactor | no | |
| Expected completion | date picker | no | renamed from "Due Date" |
| Progress % | integer 0–100 | no | manual entry; defaults to 0; not auto-computed |
| Images | multi-image upload to **Cloudinary** | no | accepts multiple files; backend stores `imageUrls: string[]` (Cloudinary secure URLs) |

Submit → `POST /api/tasks`. On success the user is redirected to `/tasks/:id` (or back to the previous board if `?returnTo=board` is present).

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
- `statusId=<id>` — filter by a team-specific status (only meaningful with `teamId`)
- `teamId=<id>` — from team dropdown
- `page=1&limit=20`

> **Note**: with dynamic per-team statuses there is no global status enum any more. The Tasks list status tabs apply only when a single team is selected and are populated from that team's statuses. When "All Teams" is selected, status tabs are hidden.

**Response (200)**
```json
{
  "tasks": [
    {
      "id": "TF-001",
      "title": "Fix navigation bug on mobile",
      "priority": "high",
      "statusId": "stat_2",
      "status": { "id": "stat_2", "name": "In Progress" },
      "label": "bug",
      "assigneeId": "u1",
      "teamId": "team_1",
      "expectedCompletion": "2026-06-15",
      "progress": 35,
      "imageUrls": [],
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
  "description": "<p>rich-text body</p>",
  "priority": "medium",
  "statusId": "stat_1",
  "label": "feature",
  "teamId": "team_1",
  "assigneeId": "u1",
  "expectedCompletion": "2026-06-30",
  "progress": 0,
  "imageUrls": ["https://res.cloudinary.com/..."]
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
