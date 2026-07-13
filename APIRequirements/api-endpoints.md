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
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "title": "string",
  "avatarInitials": "AC",
  "avatarUrl": null,
  "workspaces": [
    { "workspaceId": "ws_1", "role": "owner", "status": "active", "joinedAt": "2026-06-01T00:00:00Z" }
  ],
  "teams": [
    { "teamId": "team_1", "workspaceId": "ws_1", "role": "admin",     "joinedAt": "2026-06-01T00:00:00Z" },
    { "teamId": "team_2", "workspaceId": "ws_1", "role": "developer", "joinedAt": "2026-06-05T00:00:00Z" }
  ]
}
```
`workspaces[]` and `teams[]` are the authoritative membership arrays on the User. All workspace and team access decisions are derived from these two arrays.

---

## Task Service  `/api/tasks`

> Drives the **Task MFE** (`mfe-task`) — list view, detail, create/edit form.
> Confirmed against the live swagger; supersedes the earlier plan below it in this
> section, which used a different path/field shape (kept struck through for history —
> see the actual implementation in `mfe-task/src/lib/services/tasks.service.ts`).

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/tasks` | Auth | List tasks (filterable by `search`, `teamId`, `assigneeId`) |
| GET | `/api/tasks/my` | Auth | List the current user's tasks — powers the "My Tasks" screen |
| POST | `/api/tasks` | Auth | Create a task |
| GET | `/api/tasks/:id` | Auth | Get single task |
| PUT | `/api/tasks/:id` | Auth | Update task fields (full `UpdateTaskRequestDto` — no `teamId`, team is immutable) |
| DELETE | `/api/tasks/:id` | Auth | Delete task |
| PATCH | `/api/tasks/:id/status` | Auth | Change only the task's status (drag-drop / quick move) |
| GET | `/api/board-statuses/team/:teamId` | Auth | Team's status catalog — `{ statusId, statusName }[]`, powers the status dropdown + per-team status tabs |

### `GET /api/tasks/my`
**Query params**
```
search=string          (optional)
teamId=uuid             (optional — omit for all teams)
page=1&limit=10
```
**Response `200`**
```json
{
  "data": [
    {
      "id": "3f2b6c1a-...",
      "taskNumber": 1,
      "title": "Implement authentication flow",
      "priority": "High",
      "statusId": "b2a1...",
      "label": "Feature",
      "teamId": "team-uuid",
      "assignees": [ { "userId": "uuid", "name": "Alice Chen", "avatarInitials": "AC" } ],
      "expectedCompletion": "2026-06-12T00:00:00Z",
      "progress": 35,
      "createdBy": "uuid",
      "createdAt": "2026-06-01T00:00:00Z",
      "updatedAt": "2026-06-10T00:00:00Z"
    }
  ],
  "total": 7,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```
Note: status *names* are not embedded on the task — resolve `statusId` against
`GET /api/board-statuses/team/:teamId` for the task's team.

### `POST /api/tasks`
**Request**
```json
{
  "title": "string",
  "description": "<p>rich-text body</p>",
  "priority": "High",
  "label": "Feature",
  "statusId": "uuid",
  "teamId": "uuid",
  "assigneeIds": ["uuid", "uuid"],
  "expectedCompletion": "2026-06-20T00:00:00Z",
  "progress": 0
}
```
**Response `200`** — full Task object (see `ApiTask` in `models.md`).

### `PUT /api/tasks/:id`
**Request** — any subset of the create fields, **except `teamId`** (a task's team cannot be changed after creation).
```json
{ "statusId": "uuid", "progress": 80 }
```
**Response `200`** — updated Task object.

### `PATCH /api/tasks/:id/status`
**Request**
```json
{ "statusId": "uuid" }
```
**Response `200`** — updated Task object.

<details>
<summary>Superseded plan (kept for history — not the live contract)</summary>

The endpoints below were the original v1 plan (`/api/tasks/stats`, single `assigneeId`,
lowercase enums, embedded `status`/`team` objects, `imageUrls`). The live backend does not
implement them this way — see the confirmed shapes above instead.

</details>

---

## Board Service  `/api/board`

> Drives the **Board MFE** (`mfe-board`). Statuses are dynamic per team — each team owns a `board_statuses` list. Tasks reference a status by id.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/tasks/team/:teamId/board` | Auth | Team's board — statuses + tasks. ✅ confirmed live path (returns 401 unauth). Consumed by `TeamService.getTeamBoard()` in mfe-board. The `/api/board/:teamId` path below is **not** live (404) — kept for history |
| GET | `/api/board/:teamId` | Auth | ⚠️ 404 on the live backend — superseded by `/api/tasks/team/:teamId/board` above |
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

> Drives the **Shell** — Teams section.
> - `shell/components/teams/TeamsScreen.tsx` — list + stats (`/teams`)
> - `shell/app/(shell)/teams/new/page.tsx` — Create Team page (`/teams/new`)
> - `shell/app/(shell)/teams/[id]/page.tsx` — Manage Team page (`/teams/:id`)
> - `shell/components/teams/TeamInviteModal.tsx` — Invite by email (modal)
>
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
{ "name": "Frontend Team", "description": "optional", "color": "#6155DD", "memberIds": [{ "userId": "u2", "role": "developer" }] }
```
- `color` — required hex color chosen from the 8-swatch colour picker on the Create Team page (`/teams/new`).
- `memberIds` — optional array of workspace members to add at creation time (React Select multi-select on the Create Team page), each with an assigned role. Creator is automatically added as `admin` server-side regardless.

**Response `201`** — full Team object. Creator is automatically added as `admin`.

### `PATCH /api/teams/:id`
**Request** — any subset of `{ name, description, color }`.
```json
{ "name": "Core Platform", "color": "#32B173" }
```
**Response `200`** — updated Team object.
`403` if caller is not `admin` on this team.

### `POST /api/teams/:id/members`
Adds an existing **workspace member** (already in `/api/people`) to a team with a specified role.  
Used by the "Add from workspace" section on the Manage Team page (`/teams/:id`).

**Request**
```json
{ "userId": "u2", "role": "developer" }
```
**Response `201`** — new TeamMember object.  
Returns `409` if the user is already on the team.

### `POST /api/teams/:id/invite`
Invites someone by email into the team. The `addToWorkspace` flag controls whether they are also added to the workspace.  
Used by the **Invite** button modal (`TeamInviteModal`).

**Request**
```json
{ "email": "colleague@example.com", "role": "developer", "addToWorkspace": false }
```
- `addToWorkspace: false` — invite is team-scoped only.
- `addToWorkspace: true` — also creates a `workspace_invitation`; the invitee joins both on acceptance.

**Response `201`**
```json
{ "id": "uuid", "teamId": "team_1", "email": "colleague@example.com", "role": "developer", "status": "pending", "expiresAt": "2026-06-18T00:00:00Z" }
```
Returns `409` if a pending invite already exists for that email + team.

### `PATCH /api/teams/:id/members/:userId`
Changes a member's role. A team must always have at least one `admin` — returns `422` if attempting to demote the only admin.

**Request**
```json
{ "role": "pm" }
```
**Response `200`** — updated TeamMember object.

### `DELETE /api/teams/:id/members/:userId`
Removes a member from the team (not the workspace). Their tasks remain but `assignee_id` becomes `null`.  
Returns `422` if attempting to remove the only `admin`.

**Response `200`**
```json
{ "ok": true }
```

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
| TeamsScreen — "New Team" button → navigates to `/teams/new` | (navigation only) |
| `/teams/new` — Create Team page submit (name + desc + color + member multi-select) | `POST /api/teams` (includes `color` + `memberIds[]`) |
| TeamCard — "Manage" button → navigates to `/teams/:id` | (navigation only) |
| `/teams/:id` — Manage Team page save (edit name / desc / color) | `PATCH /api/teams/:id` |
| `/teams/:id` — Add from workspace (member picker + role, Add button) | `POST /api/teams/:id/members` |
| `/teams/:id` — Change member role dropdown | `PATCH /api/teams/:id/members/:userId` |
| `/teams/:id` — Remove member button (useConfirm) | `DELETE /api/teams/:id/members/:userId` |
| `/teams/:id` — Delete Team (danger zone, useConfirm) | `DELETE /api/teams/:id` |
| TeamCard — "Invite" button → TeamInviteModal (email + role + workspace checkbox) | `POST /api/teams/:id/invite` |
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
| TaskListScreen — task list ("My Tasks") | `GET /api/tasks/my` |
| TaskListScreen — search box | `GET /api/tasks/my?search=...` |
| TaskListScreen — team filter dropdown | `GET /api/teams` (options), `GET /api/tasks/my?teamId=...` (filter) |
| TaskListScreen — dynamic status tabs (shown once a single team is selected) | `GET /api/board-statuses/team/:teamId`; tab click filters the fetched page client-side by `statusId` |
| TaskListScreen — status badge on each row | resolved via `GET /api/board-statuses/team/:teamId` for the row's team (batched across the page's unique teams with `useBoardStatusesMap`) |
| TaskListScreen — pagination (Previous/Next) | `GET /api/tasks/my?page=...` |
| "New Task" button | navigates to `/new` (`?teamId=...` preserved if a team is selected) |
| Task row edit (✎) / open (↗) icons | navigate to `/:id/edit` and `/:id` (client-side — no API) |
| TaskFormScreen — Team dropdown | `GET /api/teams`; disabled when editing (team is immutable post-creation) |
| TaskFormScreen — Status dropdown (per team) | `GET /api/board-statuses/team/:teamId` |
| TaskFormScreen — Assignees multi-select | `GET /api/people` |
| TaskFormScreen — submit (create) | `POST /api/tasks` |
| TaskFormScreen — submit (edit) | `PUT /api/tasks/:id` (no `teamId` sent) |
| TaskDetailScreen — task data | `GET /api/tasks/:id` |
| TaskDetailScreen — status name, team name/color | `GET /api/board-statuses/team/:teamId`, `GET /api/teams` |
| TaskDetailScreen — Edit Task button | navigates to `/:id/edit` |
| TaskDetailScreen — Delete Task button (ConfirmProvider modal) | `DELETE /api/tasks/:id` |
| Sidebar / Topbar — user card | derived from `taskflow_name`/`taskflow_email` cookies — no API call yet (`GET /api/auth/me` not wired in Task MFE) |

> Not yet wired in this pass (no UI surface added for them): `GET /api/tasks` (all-teams/assignee-filtered view), `PATCH /api/tasks/:id/status` (drag-drop — Board MFE concern), `GET /api/notifications`.

### Board MFE (`mfe-board/`)

| Frontend element | Endpoint |
|---|---|
| DashboardComponent (`/board` landing) — "My Boards" team cards | `GET /api/teams` via `BoardService.getTeams()` — returns `ApiTeam[]`. Card assignees come from `members[].avatarInitials`; the To Do / In Progress / Done counts and total come from each team's `statusTaskCounts`. No static data |
| Topbar team-switcher dropdown (Board MFE only) | `GET /api/teams` |
| Kanban columns + tasks (BoardComponent) | `GET /api/tasks/team/:teamId/board` via `TeamService.getTeamBoard()` — response mapped to columns/tasks in the component; no static data |
| Column "Load more" tasks | `GET /api/board/:teamId/status/:statusId/tasks?page&limit` |
| "+ Add Status" modal submit | `POST /api/board/:teamId/statuses` |
| Edit status (✎) modal submit | `PATCH /api/board/:teamId/statuses/:statusId` |
| Delete status (🗑) | `DELETE /api/board/:teamId/statuses/:statusId` |
| Drag task to another column | `PATCH /api/tasks/:id/status` via `TeamService.updateTaskStatus(taskId, statusId)` — body `{ statusId }`. ✅ confirmed live (PATCH → 401 unauth; PUT/POST → 405) |
| "+ Add Task" button per column | navigates to `/tasks/new?teamId=&statusId=` → `POST /api/tasks` |
| Task card "↗" open icon | navigates to `/tasks/:id` |
| Sidebar — user card | `GET /api/auth/me` |
| Topbar — notification bell | `GET /api/notifications` |

> **CORS / same-origin proxy**: the Board MFE calls all backend endpoints as relative `/api/*`
> paths (never the absolute backend origin), so requests stay same-origin and never trigger CORS.
> In `ng serve` the Angular dev proxy (`mfe-board/proxy.conf.json`) forwards `/api` →
> `https://taskflowbackend-50mh.onrender.com`; in the worker path, the Cloudflare Worker routes
> `/api/*` → `GATEWAY_URL`. Point `GATEWAY_URL` at the real backend origin for the worker path.
