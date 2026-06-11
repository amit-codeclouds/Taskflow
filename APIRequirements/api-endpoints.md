# API Endpoints

> All routes are relative to each microservice's base URL.
> The Cloudflare Worker (or an API Gateway) will prefix them in production.
>
> Convention:
> - Request/response bodies are JSON unless noted.
> - All list endpoints support `?page=1&limit=20` pagination by default.
> - Authenticated routes require `taskflow_session` httpOnly cookie.
> - `[Auth]` = requires valid session. `[Public]` = no session needed.

---

## Response Envelope

Every endpoint — success or failure — returns this wrapper.

### Success (single object)

```json
{
  "status": true,
  "code": 200,
  "result": {
    "id": "uuid",
    "..."  : "..."
  },
  "message": "Task updated successfully.",
  "errors": [],
  "dev_message": "",
  "requestId": "req_01J3K9X2M4N5P6Q7R8S9T0",
  "timestamp": "2026-06-11T10:00:00.000Z"
}
```

### Success (list / paginated)

```json
{
  "status": true,
  "code": 200,
  "result": {
    "data": [],
    "count": 20,
    "total": 142,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  },
  "message": "",
  "errors": [],
  "dev_message": "",
  "requestId": "req_01J3K9X2M4N5P6Q7R8S9T0",
  "timestamp": "2026-06-11T10:00:00.000Z"
}
```

### Failure

```json
{
  "status": false,
  "code": 422,
  "result": null,
  "message": "Validation failed.",
  "errors": [
    { "field": "email",    "code": "INVALID_FORMAT",  "message": "Enter a valid email address." },
    { "field": "dueDate",  "code": "REQUIRED",        "message": "Due date is required."        }
  ],
  "dev_message": "ValidationError thrown at TaskService.create() — only populated outside production",
  "requestId": "req_01J3K9X2M4N5P6Q7R8S9T0",
  "timestamp": "2026-06-11T10:00:00.000Z"
}
```

### Field reference

| Field | Type | Notes |
|---|---|---|
| `status` | `boolean` | `true` = success, `false` = any error |
| `code` | `number` | Mirrors the HTTP status code |
| `result` | `object \| null` | The payload. `null` on any failure — never absent |
| `message` | `string` | User-displayable string. Empty string `""` if nothing to show |
| `errors` | `array` | Empty `[]` on success. Each item: `{ field?, code, message }` — `field` absent for non-field errors |
| `dev_message` | `string` | Stack trace / internal detail. **Populated only outside production** — always `""` in prod |
| `requestId` | `string` | Unique ID for this request. Use to correlate logs across microservices |
| `timestamp` | `string` | ISO 8601 UTC — when the response was generated |

### Error codes (standard set)

| `code` (HTTP) | When |
|---|---|
| `400` | Malformed request body / bad JSON |
| `401` | No session cookie or expired session |
| `403` | Valid session but insufficient permissions |
| `404` | Resource not found |
| `409` | Conflict — e.g. duplicate invite, duplicate email |
| `422` | Validation failed — `errors[]` will be populated |
| `429` | Rate limit exceeded |
| `500` | Unexpected server error |
| `502` | Upstream service unreachable (Cloudflare Worker gateway) |

---

## Auth Service  `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Email + password → sets session cookie |
| POST | `/api/auth/logout` | Auth | Clears session cookie |
| GET | `/api/auth/me` | Auth | Returns current user |

### `POST /api/auth/login`
**Request**
```json
{ "email": "string", "password": "string" }
```
**Response `200`**
```json
{ "user": { "id": "uuid", "name": "string", "email": "string", "avatarInitials": "AC" } }
```
Sets `Set-Cookie: taskflow_session=<signed>; Path=/; HttpOnly; SameSite=Lax`

### `GET /api/auth/me`
**Response `200`**
```json
{ "id": "uuid", "name": "string", "email": "string", "avatarInitials": "AC", "avatarUrl": null }
```

---

## Task Service  `/api/tasks`

> Drives the **Task MFE** (`mfe-task`) — list view, stats, filters.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/tasks` | Auth | List tasks (filterable) |
| POST | `/api/tasks` | Auth | Create a task |
| GET | `/api/tasks/:id` | Auth | Get single task |
| PATCH | `/api/tasks/:id` | Auth | Update task fields |
| DELETE | `/api/tasks/:id` | Auth | Delete task |
| GET | `/api/tasks/stats` | Auth | Aggregate counts by status |

### `GET /api/tasks`
**Query params**
```
status=todo|in-progress|review|done   (optional)
priority=high|medium|low              (optional)
assigneeId=uuid                       (optional)
projectId=uuid                        (optional)
sprintId=uuid                         (optional)
page=1&limit=20
```
**Response `200`**
```json
{
  "data": [
    {
      "id": "TF-001",
      "title": "Implement authentication flow",
      "priority": "high",
      "status": "in-progress",
      "label": "feature",
      "assignee": { "id": "uuid", "name": "Alice Chen", "avatarInitials": "AC" },
      "dueDate": "2026-06-12",
      "createdAt": "2026-06-01T00:00:00Z",
      "updatedAt": "2026-06-10T00:00:00Z"
    }
  ],
  "total": 7,
  "page": 1,
  "limit": 20
}
```

### `GET /api/tasks/stats`
**Response `200`**
```json
{
  "total": 7,
  "todo": 2,
  "inProgress": 2,
  "review": 2,
  "done": 1
}
```
> This feeds the stats row in the Task MFE (Total / In Progress / In Review / Done cards).

### `POST /api/tasks`
**Request**
```json
{
  "title": "string",
  "priority": "high",
  "status": "todo",
  "label": "feature",
  "assigneeId": "uuid",
  "dueDate": "2026-06-20",
  "description": "optional",
  "projectId": "uuid (optional)",
  "sprintId": "uuid (optional)"
}
```
**Response `201`** — full Task object

### `PATCH /api/tasks/:id`
**Request** — any subset of Task fields
```json
{ "status": "done" }
```
**Response `200`** — updated Task object

---

## Board Service  `/api/board`

> Drives the **Board MFE** (`mfe-board`) — Kanban columns.
> The board is a view over tasks; no separate board rows are persisted.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/board` | Auth | Tasks grouped by status (Kanban columns) |
| PATCH | `/api/board/move` | Auth | Move a task to a different column (status change) |

### `GET /api/board`
**Query params**
```
projectId=uuid    (optional — defaults to personal board)
sprintId=uuid     (optional)
```
**Response `200`**
```json
{
  "columns": [
    {
      "id": "todo",
      "title": "To Do",
      "tasks": [ /* Task objects */ ]
    },
    {
      "id": "in-progress",
      "title": "In Progress",
      "tasks": [ /* Task objects */ ]
    },
    {
      "id": "review",
      "title": "Review",
      "tasks": []
    },
    {
      "id": "done",
      "title": "Done",
      "tasks": []
    }
  ]
}
```

### `PATCH /api/board/move`
**Request**
```json
{ "taskId": "TF-001", "toStatus": "done" }
```
**Response `200`** — updated Task object

---

## Team Service  `/api/teams`

> Drives the **Shell** — `shell/components/teams/TeamsScreen.tsx`.
> Teams are separate from Projects. A team groups users; a project groups tasks.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/teams` | Auth | List teams the current user belongs to |
| POST | `/api/teams` | Auth | Create a new team |
| GET | `/api/teams/:id` | Auth | Get team details with members |
| PATCH | `/api/teams/:id` | Auth | Update team name / description |
| DELETE | `/api/teams/:id` | Auth | Delete team (admin only) |
| GET | `/api/teams/stats` | Auth | Aggregate: total teams, members, pending invites |
| POST | `/api/teams/:id/invite` | Auth | Send email invitation |
| DELETE | `/api/teams/:id/members/:userId` | Auth | Remove a member |
| PATCH | `/api/teams/:id/members/:userId` | Auth | Change member role |

### `GET /api/teams`
**Response `200`**
```json
{
  "data": [
    {
      "id": "team_1",
      "name": "Taskflow Core",
      "description": "Engineering team building the core platform.",
      "color": "#6155DD",
      "ownerId": "uuid",
      "members": [
        { "userId": "uuid", "user": { "name": "Arkabrata", "avatarInitials": "AC" }, "role": "admin" }
      ],
      "pendingInvites": 1,
      "createdAt": "2026-06-01T00:00:00Z",
      "updatedAt": "2026-06-10T00:00:00Z"
    }
  ]
}
```

### `GET /api/teams/stats`
**Response `200`**
```json
{
  "totalTeams": 2,
  "totalMembers": 4,
  "pendingInvites": 1
}
```
> Feeds the 3-card stats row in `TeamsScreen`.

### `POST /api/teams`
**Request**
```json
{ "name": "Frontend Team", "description": "optional" }
```
**Response `201`** — full Team object. Creator is automatically added as `admin`.

### `POST /api/teams/:id/invite`
**Request**
```json
{ "email": "colleague@example.com" }
```
**Response `201`**
```json
{ "id": "uuid", "teamId": "team_1", "email": "colleague@example.com", "status": "pending", "expiresAt": "2026-06-18T00:00:00Z" }
```
Sends an invitation email. Returns `409` if a pending invite already exists for that email + team.

### `PATCH /api/teams/:id/members/:userId`
**Request**
```json
{ "role": "admin" }
```
**Response `200`** — updated TeamMember object.

---

## Dashboard Service  `/api/dashboard`

> Drives `shell/components/home/WelcomeScreen.tsx` — the 4-card stats row.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard/stats` | Auth | Aggregate stats for the current user |

### `GET /api/dashboard/stats`
**Response `200`**
```json
{
  "totalTasks": 142,
  "inProgress": 28,
  "completed": 96,
  "boardItems": 18,
  "completionRate": 67
}
```
> `totalTasks` = all tasks where `assigneeId` = current user.
> `boardItems` = tasks in the currently active sprint across all projects.

---

## User Service  `/api/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/users` | Auth | List users (for assignee picker) |
| GET | `/api/users/:id` | Auth | Get user profile |
| PATCH | `/api/users/:id` | Auth | Update own profile |

### `GET /api/users`
**Response `200`**
```json
{
  "data": [
    { "id": "uuid", "name": "Alice Chen", "email": "alice@...", "avatarInitials": "AC" }
  ]
}
```

---

## Project Service  `/api/projects`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/projects` | Auth | List projects for current user |
| POST | `/api/projects` | Auth | Create project |
| GET | `/api/projects/:id` | Auth | Get project details |
| GET | `/api/projects/:id/sprints` | Auth | List sprints for project |
| POST | `/api/projects/:id/sprints` | Auth | Create sprint |
| PATCH | `/api/projects/:id/sprints/:sprintId` | Auth | Update sprint (activate, complete) |

---

## Activity Service  `/api/activity`

> Backed by MongoDB `activity_logs`. Read-only from the frontend.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/activity` | Auth | Recent activity feed (current user) |
| GET | `/api/activity/tasks/:taskId` | Auth | Activity timeline for a task |

### `GET /api/activity/tasks/:taskId`
**Response `200`**
```json
{
  "data": [
    {
      "id": "mongo-objectid",
      "action": "status_changed",
      "actor": { "id": "uuid", "name": "Alice Chen", "avatarInitials": "AC" },
      "diff": { "status": { "from": "todo", "to": "in-progress" } },
      "timestamp": "2026-06-11T10:00:00Z"
    }
  ]
}
```

---

## Notification Service  `/api/notifications`

> Backed by MongoDB `notifications`.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications` | Auth | List unread notifications |
| PATCH | `/api/notifications/:id/read` | Auth | Mark one notification as read |
| PATCH | `/api/notifications/read-all` | Auth | Mark all as read |

---

## User Preferences Service  `/api/preferences`

> Backed by MongoDB `user_preferences`.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/preferences` | Auth | Get current user's preferences |
| PATCH | `/api/preferences` | Auth | Update preferences (partial) |

---

## Error Response Shape

See the **Response Envelope** section at the top. All errors use the same wrapper — `status: false`, `result: null`, `errors[]` populated. No separate error shape.

---

## Frontend → Endpoint traceability

### Shell (`shell/`)

| Frontend element | Endpoint |
|---|---|
| WelcomeScreen — 4 stat cards (Total Tasks, In Progress, Completed, Board Items) | `GET /api/dashboard/stats` |
| WelcomeScreen — "Go to Tasks" / "Go to Board" buttons | client navigation only |
| WelcomeScreen — Project Timeline phases | static/no API needed |
| TeamsScreen — 3 stat cards (Total Teams, Total Members, Pending Invites) | `GET /api/teams/stats` |
| TeamsScreen — team list | `GET /api/teams` |
| TeamsScreen — "New Team" button + create form | `POST /api/teams` |
| TeamsScreen — "Invite" button + email form | `POST /api/teams/:id/invite` |
| Sidebar — user card (name, role) | `GET /api/auth/me` |
| Topbar — bell icon / notification dot | `GET /api/notifications` |
| Topbar — avatar | `GET /api/auth/me` |

### Task MFE (`mfe-task/`)

| Frontend element | Endpoint |
|---|---|
| Task list | `GET /api/tasks` |
| Stats row (Total / In Progress / In Review / Done) | `GET /api/tasks/stats` |
| Filter tabs (All / In Progress / Review / To Do / Done) | `GET /api/tasks?status=...` |
| "New Task" button | `POST /api/tasks` |
| Task row checkbox (mark done) | `PATCH /api/tasks/:id` `{ status: 'done' }` |
| Sidebar — user card | `GET /api/auth/me` |
| Topbar — notification bell | `GET /api/notifications` |

### Board MFE (`mfe-board/`)

| Frontend element | Endpoint |
|---|---|
| Kanban columns with tasks | `GET /api/board` |
| Drag task to another column | `PATCH /api/board/move` |
| "+ Add Task" button per column | `POST /api/tasks` |
| "Filter" button (future) | `GET /api/board?sprintId=...` |
| Sidebar — user card | `GET /api/auth/me` |
| Topbar — notification bell | `GET /api/notifications` |
