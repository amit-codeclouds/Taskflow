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
| POST | `/api/auth/signup` | Public | Register — name + email + title + password → sets session cookies |
| POST | `/api/auth/login` | Public | Email + password → sets session cookies |
| POST | `/api/auth/logout` | Auth | Clears all session cookies |
| GET | `/api/auth/me` | Auth | Returns current user |

### `POST /api/auth/signup`
**Request**
```json
{ "name": "string", "email": "string", "password": "string", "title": "string (optional)" }
```
`title` is the resolved designation — if the user selected "Other" on the form, the free-text value is sent here, never the string `"Other"`.

**Response `201`**
```json
{ "ok": true, "user": { "id": "uuid", "name": "string", "email": "string", "title": "string", "avatarInitials": "AC" } }
```
Sets cookies: `taskflow_session` (httpOnly) + `taskflow_name` + `taskflow_email` + `taskflow_title`.

**Error `409`** — email already registered.

### `POST /api/auth/login`
**Request**
```json
{ "email": "string", "password": "string" }
```
**Response `200`**
```json
{ "user": { "id": "uuid", "name": "string", "email": "string", "title": "string", "avatarInitials": "AC" } }
```
Sets `taskflow_session` (httpOnly) + `taskflow_name` + `taskflow_email` + `taskflow_title`.

### `GET /api/auth/me`
**Response `200`**
```json
{ "id": "uuid", "name": "string", "email": "string", "title": "string", "avatarInitials": "AC", "avatarUrl": null }
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
statusId=stat_1                       (optional — only meaningful with teamId)
priority=high|medium|low              (optional)
teamId=team_1|team_2|...              (optional — omit for "My Tasks" view)
assigneeId=uuid                       (optional)
projectId=uuid                        (optional)
sprintId=uuid                         (optional)
page=1&limit=20
```
Soft-deleted tasks (`deleted_at IS NOT NULL`) are excluded.
**Response `200`**
```json
{
  "data": [
    {
      "id": "TF-001",
      "title": "Implement authentication flow",
      "priority": "high",
      "statusId": "stat_2",
      "status": { "id": "stat_2", "name": "In Progress" },
      "label": "feature",
      "assignee": { "id": "uuid", "name": "Alice Chen", "avatarInitials": "AC" },
      "team": { "id": "team_1", "name": "Taskflow Core", "color": "#6155DD" },
      "expectedCompletion": "2026-06-12",
      "progress": 35,
      "imageUrls": [],
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
  "description": "<p>rich-text body</p>",
  "priority": "high",
  "statusId": "stat_1",
  "label": "feature",
  "assigneeId": "uuid",
  "teamId": "team_1",
  "expectedCompletion": "2026-06-20",
  "progress": 0,
  "imageUrls": ["https://res.cloudinary.com/..."],
  "projectId": "uuid (optional)",
  "sprintId": "uuid (optional)"
}
```
**Response `201`** — full Task object.
> Image upload itself happens client → Cloudinary (signed upload). Returned secure URLs are passed in `imageUrls`.

### `PATCH /api/tasks/:id`
**Request** — any subset of Task fields
```json
{ "statusId": "stat_3", "progress": 80 }
```
**Response `200`** — updated Task object

---

## Board Service  `/api/board`

> Drives the **Board MFE** (`mfe-board`). Statuses are dynamic per team — each team owns a `board_statuses` list. Tasks reference a status by id.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/board/:teamId` | Auth | Team's statuses + first 5 tasks per status |
| GET | `/api/board/:teamId/status/:statusId/tasks` | Auth | Load more tasks for one status |
| POST | `/api/board/:teamId/statuses` | Auth | Create a status (admin / pm) |
| PATCH | `/api/board/:teamId/statuses/:statusId` | Auth | Edit a status (admin / pm / tl) |
| DELETE | `/api/board/:teamId/statuses/:statusId` | Auth | Delete a status; soft-deletes its tasks (admin / pm / tl) |
| PATCH | `/api/tasks/:id/status` | Auth | Drag-drop: change a task's status |

### `GET /api/board/:teamId`
Returns the team's statuses, each with its first 5 tasks.

**Response `200`**
```json
{
  "statuses": [
    {
      "id": "stat_1",
      "name": "Backlog",
      "description": "Not yet started",
      "position": 0,
      "totalTasks": 8,
      "tasks": [ /* up to 5 Task objects */ ]
    },
    {
      "id": "stat_2",
      "name": "In Progress",
      "description": null,
      "position": 1,
      "totalTasks": 3,
      "tasks": [ /* up to 5 Task objects */ ]
    }
  ]
}
```

### `GET /api/board/:teamId/status/:statusId/tasks`
Paginated tasks for one status — used by the column's "Load more" button.

**Query params**
```
page=2&limit=10
```
**Response `200`**
```json
{
  "data": [ /* Task objects */ ],
  "count": 10,
  "total": 18,
  "page": 2,
  "limit": 10,
  "totalPages": 2
}
```

### `POST /api/board/:teamId/statuses`
**Request**
```json
{ "name": "Code Review", "description": "Awaiting PR approval" }
```
**Response `201`** — new BoardStatus object; `position = max + 1`.
`403` if caller is not `admin` or `pm` on this team.

### `PATCH /api/board/:teamId/statuses/:statusId`
**Request** — any subset of `{ name, description, position }`.
**Response `200`** — updated BoardStatus.
`403` if caller is `developer`.

### `DELETE /api/board/:teamId/statuses/:statusId`
Deletes the status; tasks belonging to it are **soft-deleted** (`tasks.deleted_at = now()`).
Returns `422` if this is the last remaining status of the team.
**Response `200`**
```json
{ "ok": true, "softDeletedTaskCount": 8 }
```

### `PATCH /api/tasks/:id/status`
Drag-drop move. Replaces the old `PATCH /api/board/move`.
**Request**
```json
{ "statusId": "stat_2" }
```
**Response `200`** — updated Task object.
`403` if a `developer` attempts to move a task they don't own.

---

## People / Workspace Service  `/api/people`

> Drives the **Shell** — `shell/components/people/PeopleScreen.tsx`.  
> Manages the workspace-level member directory — all users (active + pending) who have been
> invited to the workspace, regardless of team membership.  
> This is distinct from `/api/teams/:id/members` which is team-scoped.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/people` | Auth | List all workspace members (active + pending) |
| GET | `/api/people/stats` | Auth | Aggregate counts (total, active, pending, teams) |
| POST | `/api/people/invite` | Auth | Invite someone to the workspace by email |
| PATCH | `/api/people/:userId` | Auth | Update member title / role |
| DELETE | `/api/people/:userId` | Auth | Remove member from workspace (and all teams) |

### `GET /api/people`
**Query params**
```
teamId=team_1           (optional — filter by team membership)
status=active|pending   (optional)
search=string           (optional — name or email substring)
page=1&limit=50
```
**Response `200`**
```json
{
  "data": [
    {
      "id": "u1",
      "initials": "AC",
      "name": "Arkabrata C.",
      "email": "arkabrata@codeclouds.com",
      "title": "Engineer",
      "teamIds": ["team_1", "team_2"],
      "status": "active"
    },
    {
      "id": "u5",
      "initials": "PR",
      "name": "Priya R.",
      "email": "priya@external.com",
      "title": "—",
      "teamIds": [],
      "status": "pending"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 50
}
```

### `GET /api/people/stats`
**Response `200`**
```json
{
  "totalMembers": 5,
  "active": 4,
  "pendingInvites": 1,
  "totalTeams": 3
}
```
> Feeds the 4-card stats row in `PeopleScreen`.

### `POST /api/people/invite`
**Request**
```json
{ "email": "colleague@example.com" }
```
**Response `201`**
```json
{ "id": "uuid", "email": "colleague@example.com", "status": "pending", "expiresAt": "2026-06-18T00:00:00Z" }
```
Sends a workspace invitation email. Returns `409` if already an active member or has a pending invite.  
The invited person appears in the People list with `status: "pending"` until they accept.

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
| POST | `/api/teams/:id/members` | Auth | Add an existing workspace member to the team |
| POST | `/api/teams/:id/invite` | Auth | Send email invitation to a non-member |
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

### `POST /api/teams/:id/members`
Adds an existing **workspace member** (already in `/api/people`) to a team.  
This is used by the "From workspace" tab in the Teams invite form.

**Request**
```json
{ "userId": "u2" }
```
**Response `201`** — new TeamMember object.  
Returns `409` if the user is already on the team.

### `POST /api/teams/:id/invite`
Invites someone **not yet in the workspace** to the workspace AND the team in one step.  
Used by the "Invite by email" tab in the Teams invite form.

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
| WelcomeScreen — App showcase cards (Tasks, Board) | client navigation only — `<a>` cross-zone links |
| WelcomeScreen — Project Timeline phases | static / no API needed |
| TeamsScreen — 3 stat cards (Total Teams, Total Members, Pending Invites) | `GET /api/teams/stats` |
| TeamsScreen — team list | `GET /api/teams` |
| TeamsScreen — "New Team" button + create form | `POST /api/teams` |
| TeamsScreen — InviteForm "From workspace" tab (pick existing member) | `POST /api/teams/:id/members` |
| TeamsScreen — InviteForm "Invite by email" tab (new person) | `POST /api/teams/:id/invite` |
| PeopleScreen — 4 stat cards (Total, Active, Pending Invites, Teams) | `GET /api/people/stats` |
| PeopleScreen — member list | `GET /api/people` |
| PeopleScreen — search filter | `GET /api/people?search=...` |
| PeopleScreen — team filter dropdown | `GET /api/people?teamId=...` |
| PeopleScreen — status filter dropdown | `GET /api/people?status=active\|pending` |
| PeopleScreen — "Invite to workspace" button → InviteModal submit | `POST /api/people/invite` |
| PeopleScreen — "Resend" action (pending member row) | `POST /api/people/invite` (re-send to same email → 200, resets expiry) |
| PeopleScreen — "Remove" action (active member) | `DELETE /api/people/:userId` |
| PeopleScreen — "Remove" action (pending member — cancel invite) | `DELETE /api/people/:userId` |
| SettingsScreen — Profile (name, title) read | `GET /api/auth/me` |
| SettingsScreen — Profile save | `PATCH /api/users/:id` |
| SettingsScreen — Notification toggles save | `PATCH /api/preferences` |
| Sidebar — workspace indicator (owner name) | derived from `taskflow_name` cookie — no API call |
| Sidebar — user card (name, initials) | `GET /api/auth/me` |
| Topbar — bell icon | _commented out — not yet wired_ |
| Topbar — avatar | `GET /api/auth/me` |
| LoginForm — submit | `POST /api/auth/login` |
| SignupForm — submit | `POST /api/auth/signup` |

### Task MFE (`mfe-task/`)

| Frontend element | Endpoint |
|---|---|
| Task list (all teams — "My Tasks" view) | `GET /api/tasks` |
| Stats row (Total / In Progress / In Review / Done) | `GET /api/tasks/stats` |
| Status filter tabs (All / In Progress / Review / To Do / Done) | `GET /api/tasks?status=...` |
| Team filter bar (All / Taskflow Core / Design System / API Gateway) | `GET /api/tasks?teamId=...` |
| Team badge on each task row | populated from `task.team` in response |
| "New Task" button | navigates to `/tasks/new` |
| Task row ↗ redirect icon | navigates to `/tasks/:id` (client-side — no API) |
| Task row click (title) | navigates to `/tasks/:id` (client-side — no API) |
| Task row checkbox (mark done) | `PATCH /api/tasks/:id` `{ statusId: <done-status-id> }` |
| TaskFormScreen — Team dropdown | `GET /api/teams` |
| TaskFormScreen — Status dropdown (per team) | `GET /api/board/:teamId/statuses` |
| TaskFormScreen — submit | `POST /api/tasks` |
| TaskDetailScreen — task data | `GET /api/tasks/:id` |
| TaskDetailScreen — activity timeline | `GET /api/activity/tasks/:taskId` |
| TaskDetailScreen — Edit Task button | navigates to `/tasks/new?edit=:id` |
| Sidebar — user card | `GET /api/auth/me` |
| Topbar — notification bell | `GET /api/notifications` |

### Board MFE (`mfe-board/`)

| Frontend element | Endpoint |
|---|---|
| Teams list landing at `/board` | `GET /api/teams` |
| Topbar team-switcher dropdown (Board MFE only) | `GET /api/teams` |
| Kanban columns + first 5 tasks each | `GET /api/board/:teamId` |
| Column "Load more" tasks | `GET /api/board/:teamId/status/:statusId/tasks?page&limit` |
| "+ Add Status" modal submit | `POST /api/board/:teamId/statuses` |
| Edit status (✎) modal submit | `PATCH /api/board/:teamId/statuses/:statusId` |
| Delete status (🗑) | `DELETE /api/board/:teamId/statuses/:statusId` |
| Drag task to another column | `PATCH /api/tasks/:id/status` |
| "+ Add Task" button per column | navigates to `/tasks/new?teamId=&statusId=` → `POST /api/tasks` |
| Task card "↗" open icon | navigates to `/tasks/:id` |
| Sidebar — user card | `GET /api/auth/me` |
| Topbar — notification bell | `GET /api/notifications` |
