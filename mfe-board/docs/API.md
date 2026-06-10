# Board MFE — API Requirements

> **Scope:** Kanban board management — boards, columns, task cards, drag-and-drop reordering.
> All requests routed through the Cloudflare Worker at `/api/*` → Gateway.
> Auth via shared `taskflow_session` cookie (set by Shell).

---

## Base

| Item | Value |
|------|-------|
| Prefix | `/api/boards` |
| Auth mechanism | `HttpOnly` cookie — `taskflow_session` (inherited from Shell domain) |
| Content-Type | `application/json` |

---

## Data models

### Board
```ts
{
  id:          string
  name:        string        // e.g. "Sprint Board"
  description: string | null
  createdAt:   string        // ISO 8601 datetime
  updatedAt:   string
}
```

### Column
```ts
{
  id:       string
  boardId:  string
  title:    string           // e.g. "To Do", "In Progress", "Done"
  color:    string           // hex — shown as column dot
  position: number           // 0-indexed order for rendering
}
```

### BoardTask (card on the board — references Task from Task MFE)
```ts
{
  id:         string         // same id as Task MFE task id (e.g. "TF-001")
  columnId:   string
  boardId:    string
  position:   number         // 0-indexed order within the column
  title:      string         // denormalised for fast board render
  priority:   "high" | "medium" | "low"
  label:      string
  labelColor: string         // hex
  assignee:   string         // initials or user id
  due:        string | null  // display string e.g. "Jun 12"
}
```

---

## Endpoints

### GET /api/boards

List all boards the current user has access to.

**Auth required:** Yes

**Response — 200 OK**
```json
{
  "boards": [
    {
      "id": "board_abc",
      "name": "Sprint Board",
      "description": null,
      "createdAt": "2026-06-01T08:00:00Z",
      "updatedAt": "2026-06-10T12:00:00Z"
    }
  ]
}
```

---

### POST /api/boards

Create a new board.

**Auth required:** Yes

**Request body**
```json
{
  "name":        "string",         // required
  "description": "string | null"   // optional
}
```

**Response — 201 Created** — full Board object

---

### GET /api/boards/:boardId

Get a board together with its columns and all task cards. This is the primary load call for the board view.

**Auth required:** Yes

**Response — 200 OK**
```json
{
  "id": "board_abc",
  "name": "Sprint Board",
  "description": null,
  "columns": [
    {
      "id": "col_todo",
      "boardId": "board_abc",
      "title": "To Do",
      "color": "#6E6C6A",
      "position": 0,
      "tasks": [
        {
          "id": "TF-004",
          "columnId": "col_todo",
          "boardId": "board_abc",
          "position": 0,
          "title": "Set up analytics dashboard",
          "priority": "medium",
          "label": "feature",
          "labelColor": "#766Be8",
          "assignee": "AC",
          "due": "Jun 22"
        }
      ]
    },
    {
      "id": "col_inprogress",
      "title": "In Progress",
      "color": "#6155DD",
      "position": 1,
      "tasks": []
    },
    {
      "id": "col_done",
      "title": "Done",
      "color": "#32B173",
      "position": 2,
      "tasks": []
    }
  ]
}
```

**Notes**
- Columns are returned sorted by `position` ascending.
- Tasks within each column are returned sorted by `position` ascending.
- This single call replaces separate `/columns` and `/tasks` calls for initial page load.

---

### GET /api/boards/:boardId/columns

List columns for a board (without tasks).

**Auth required:** Yes

**Response — 200 OK**
```json
{
  "columns": [
    {
      "id": "col_todo",
      "boardId": "board_abc",
      "title": "To Do",
      "color": "#6E6C6A",
      "position": 0
    }
  ]
}
```

---

### POST /api/boards/:boardId/columns

Add a new column to a board.

**Auth required:** Yes

**Request body**
```json
{
  "title":    "string",   // required
  "color":    "string",   // required — hex color
  "position": "number"    // optional — appends to end if omitted
}
```

**Response — 201 Created** — full Column object

---

### PATCH /api/boards/:boardId/columns/:colId

Update column title or color.

**Auth required:** Yes

**Request body** (all optional)
```json
{
  "title": "string",
  "color": "string"
}
```

**Response — 200 OK** — updated Column object

---

### DELETE /api/boards/:boardId/columns/:colId

Delete a column. All tasks in the column are moved to the first column, or deleted if `deleteTasks=true`.

**Auth required:** Yes

**Query parameters**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `deleteTasks` | `boolean` | `false` | If true, permanently delete all tasks in the column |

**Response — 204 No Content**

---

### PATCH /api/boards/:boardId/tasks/:taskId/move

Move a task card to a different column and/or a new position within that column. This is the drag-and-drop endpoint.

**Auth required:** Yes

**Request body**
```json
{
  "columnId": "string",   // required — destination column id
  "position": "number"    // required — new 0-indexed position in destination column
}
```

**Response — 200 OK**
```json
{
  "id": "TF-004",
  "columnId": "col_inprogress",
  "position": 1,
  "updatedAt": "2026-06-11T10:00:00Z"
}
```

**Notes**
- Backend should update `position` for all tasks in both the source and destination columns to maintain a contiguous 0-indexed sequence.
- Also syncs `status` on the Task MFE record: `col_todo` → `todo`, `col_inprogress` → `in-progress`, `col_done` → `done`. Map is configurable per board.

---

### PATCH /api/boards/:boardId/columns/reorder

Reorder all columns in a board (drag-and-drop column repositioning).

**Auth required:** Yes

**Request body**
```json
{
  "order": ["col_inprogress", "col_todo", "col_done"]  // full ordered list of column ids
}
```

**Response — 200 OK**
```json
{
  "columns": [
    { "id": "col_inprogress", "position": 0 },
    { "id": "col_todo",       "position": 1 },
    { "id": "col_done",       "position": 2 }
  ]
}
```

---

### PATCH /api/boards/:boardId/columns/:colId/reorder

Reorder tasks within a single column (intra-column drag).

**Auth required:** Yes

**Request body**
```json
{
  "order": ["TF-007", "TF-004", "TF-008", "TF-009"]  // full ordered list of task ids in this column
}
```

**Response — 200 OK**
```json
{
  "tasks": [
    { "id": "TF-007", "position": 0 },
    { "id": "TF-004", "position": 1 }
  ]
}
```

---

### POST /api/boards/:boardId/columns/:colId/tasks

Add an existing task (from Task MFE) to a board column, or create a new task directly from the board.

**Auth required:** Yes

**Request body — add existing task**
```json
{
  "taskId": "TF-005"
}
```

**Request body — create new task**
```json
{
  "title":    "string",          // required
  "priority": "high | medium | low",  // default: "medium"
  "label":    "string",          // optional
  "due":      "string | null"    // optional
}
```

**Response — 201 Created** — full BoardTask object

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
| 404 | Board / column / task not found |
| 409 | Conflict (e.g. column with same title already exists) |
| 500 | Internal server error |

---

## Current state (Phase 0)

All data is static (`columns` array in `BoardComponent`). The component data shape already matches `Column` and `BoardTask` above. Wire these endpoints in Phase 2 when the backend is ready — no structural changes needed on the Angular side.

The `move` endpoint is the most critical to implement correctly — it must update positions atomically to avoid gaps or duplicates in the sort order.
