# Task MFE — API Requirements

> **Scope:** Full task lifecycle — create, read, update, delete, filter, and stats.
> All requests routed through the Cloudflare Worker at `/api/*` → Gateway.
> Auth via shared `taskflow_session` cookie (set by Shell).

---

## Base

| Item | Value |
|------|-------|
| Prefix | `/api/tasks`, `/api/projects`, `/api/users`, `/api/labels` |
| Auth mechanism | `HttpOnly` cookie — `taskflow_session` (inherited from Shell domain) |
| Content-Type | `application/json` |

---

## Data models

### Task
```ts
{
  id:        string          // e.g. "TF-001"
  title:     string
  status:    "todo" | "in-progress" | "review" | "done"
  priority:  "high" | "medium" | "low"
  label:     string          // e.g. "feature", "bug", "design", "docs", "infra", "refactor"
  assignee:  string          // user id
  projectId: string | null
  due:       string | null   // ISO 8601 date — "2026-06-12"
  createdAt: string          // ISO 8601 datetime
  updatedAt: string          // ISO 8601 datetime
}
```

### TaskStats
```ts
{
  total:      number
  inProgress: number
  review:     number
  done:       number
  todo:       number
}
```

---

## Endpoints

### GET /api/tasks

List tasks with optional filters.

**Auth required:** Yes

**Query parameters**

| Param | Type | Description |
|-------|------|-------------|
| `status` | `todo \| in-progress \| review \| done` | Filter by status |
| `priority` | `high \| medium \| low` | Filter by priority |
| `label` | `string` | Filter by label tag |
| `assignee` | `string` | Filter by user id |
| `projectId` | `string` | Filter by project |
| `search` | `string` | Full-text search on title |
| `page` | `number` | Page number (default: 1) |
| `limit` | `number` | Items per page (default: 50, max: 100) |

**Response — 200 OK**
```json
{
  "tasks": [
    {
      "id": "TF-001",
      "title": "Implement authentication flow",
      "status": "in-progress",
      "priority": "high",
      "label": "feature",
      "assignee": "usr_abc123",
      "projectId": "proj_xyz",
      "due": "2026-06-12",
      "createdAt": "2026-06-01T10:00:00Z",
      "updatedAt": "2026-06-10T14:22:00Z"
    }
  ],
  "total": 142,
  "page": 1,
  "limit": 50
}
```

---

### POST /api/tasks

Create a new task.

**Auth required:** Yes

**Request body**
```json
{
  "title":     "string",                              // required
  "status":    "todo | in-progress | review | done",  // default: "todo"
  "priority":  "high | medium | low",                 // default: "medium"
  "label":     "string",                              // optional
  "assignee":  "string",                              // optional — user id
  "projectId": "string | null",                       // optional
  "due":       "string | null"                        // optional — ISO 8601 date
}
```

**Response — 201 Created**
```json
{
  "id": "TF-008",
  "title": "New task title",
  "status": "todo",
  "priority": "medium",
  "label": "feature",
  "assignee": "usr_abc123",
  "projectId": null,
  "due": null,
  "createdAt": "2026-06-11T09:00:00Z",
  "updatedAt": "2026-06-11T09:00:00Z"
}
```

---

### GET /api/tasks/:id

Get a single task by ID.

**Auth required:** Yes

**Response — 200 OK** — full Task object (see data model above)

**Response — 404 Not Found**
```json
{ "error": "Task not found" }
```

---

### PATCH /api/tasks/:id

Update one or more fields on a task.

**Auth required:** Yes

**Request body** (all fields optional)
```json
{
  "title":     "string",
  "status":    "todo | in-progress | review | done",
  "priority":  "high | medium | low",
  "label":     "string",
  "assignee":  "string | null",
  "projectId": "string | null",
  "due":       "string | null"
}
```

**Response — 200 OK** — updated Task object

---

### PATCH /api/tasks/:id/status

Quick-update task status only (used by checkbox / drag events).

**Auth required:** Yes

**Request body**
```json
{
  "status": "todo | in-progress | review | done"  // required
}
```

**Response — 200 OK**
```json
{
  "id": "TF-001",
  "status": "done",
  "updatedAt": "2026-06-11T10:30:00Z"
}
```

---

### DELETE /api/tasks/:id

Delete a task permanently.

**Auth required:** Yes

**Response — 204 No Content**

**Response — 404 Not Found**
```json
{ "error": "Task not found" }
```

---

### GET /api/tasks/stats

Aggregate task counts for the dashboard stat cards.

**Auth required:** Yes

**Query parameters**

| Param | Type | Description |
|-------|------|-------------|
| `projectId` | `string` | Scope stats to a project (optional) |
| `assignee` | `string` | Scope stats to a user (optional) |

**Response — 200 OK**
```json
{
  "total":      142,
  "inProgress": 28,
  "review":     18,
  "done":       96,
  "todo":       0
}
```

**Notes**
- This powers the 4 stat cards on the Shell dashboard home (`WelcomeScreen`).
- Should respond in < 100ms — back this with a counter cache, not a COUNT query.

---

### GET /api/projects

List all projects the current user has access to.

**Auth required:** Yes

**Response — 200 OK**
```json
{
  "projects": [
    {
      "id": "proj_xyz",
      "name": "Taskflow App",
      "color": "#6155DD",
      "taskCount": 47
    }
  ]
}
```

---

### GET /api/users

List users available for task assignment.

**Auth required:** Yes

**Query parameters**

| Param | Type | Description |
|-------|------|-------------|
| `search` | `string` | Filter by name or email |

**Response — 200 OK**
```json
{
  "users": [
    {
      "id": "usr_abc123",
      "name": "Arkabrata",
      "email": "arkabrata@example.com",
      "avatar": null,
      "role": "admin"
    }
  ]
}
```

---

### GET /api/labels

List all label types in use across tasks.

**Auth required:** Yes

**Response — 200 OK**
```json
{
  "labels": ["feature", "bug", "design", "docs", "infra", "refactor"]
}
```

---

## Status codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource created |
| 204 | Success, no content (DELETE) |
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Not authorised |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate task ID) |
| 500 | Internal server error |

---

## Current state (Phase 0)

All data is static (`TASKS` array in `TaskListScreen.tsx`). Wire these endpoints in Phase 1 when the backend is ready. The component shapes match the API model above — no structural changes needed on the frontend side.
