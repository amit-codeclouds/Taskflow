# API Contracts

All REST endpoints for the Taskflow backend. These are spec-first — no backend is implemented yet. The Cloudflare Worker routes `/api/*` to `GATEWAY_URL`.

---

## Response Envelope

Every response (success and error) uses this wrapper:

```json
{
  "status": "success" | "error",
  "code": 200,
  "result": { ... },
  "message": "Human-readable description",
  "errors": [],
  "dev_message": "Technical detail (dev/staging only)",
  "requestId": "uuid",
  "timestamp": "ISO 8601"
}
```

For brevity, the examples below show only the `result` payload.

---

## Authentication

All endpoints marked **[Auth]** require a valid `taskflow_session` httpOnly cookie.  
Endpoints marked **[Public]** require no session.

---

## Auth Service — `/api/auth`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login — sets session cookie |
| POST | `/api/auth/logout` | Auth | Logout — clears session |
| GET | `/api/auth/me` | Auth | Current user |

### POST `/api/auth/login`

```json
// Request
{ "email": "user@example.com", "password": "hunter2" }

// 200 OK
{ "user": { "id": "uuid", "name": "Arkabrata C.", "email": "..." } }

// 401
{ "message": "Invalid email or password" }
```

### GET `/api/auth/me`

```json
// 200 OK
{ "id": "uuid", "name": "Arkabrata C.", "email": "...", "avatarInitials": "AC" }
```

---

## Dashboard Service — `/api/dashboard`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/dashboard/stats` | Auth | Workspace-level stats |

### GET `/api/dashboard/stats`

```json
// 200 OK
{
  "totalTasks": 142,
  "inProgress": 28,
  "completed": 96,
  "boardItems": 18,
  "completionRate": 67
}
```

---

## People Service — `/api/people`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/people` | Auth | List workspace members |
| GET | `/api/people/stats` | Auth | Member counts |
| POST | `/api/people/invite` | Auth | Invite by email |
| PATCH | `/api/people/:userId` | Auth | Update member |
| DELETE | `/api/people/:userId` | Auth | Remove member |

### GET `/api/people`

Query params: `status=active|pending` (optional)

```json
// 200 OK
{
  "members": [
    {
      "id": "u1",
      "name": "Arkabrata C.",
      "email": "arko@codeclouds.com",
      "avatarInitials": "AC",
      "title": "Engineer",
      "teamIds": ["team_1", "team_2"],
      "status": "active"
    }
  ]
}
```

### GET `/api/people/stats`

```json
// 200 OK
{ "totalMembers": 5, "active": 4, "pendingInvites": 1, "totalTeams": 3 }
```

### POST `/api/people/invite`

```json
// Request
{ "email": "newperson@example.com" }

// 201 Created
{
  "invitation": {
    "id": "inv_abc",
    "email": "newperson@example.com",
    "status": "pending",
    "expiresAt": "2026-06-19T00:00:00Z"
  }
}

// 409 Conflict
{ "message": "An invitation is already pending for this email." }
```

### DELETE `/api/people/:userId`

```json
// 200 OK
{ "ok": true }
```

---

## Teams Service — `/api/teams`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/teams` | Auth | User's teams |
| POST | `/api/teams` | Auth | Create team |
| GET | `/api/teams/:id` | Auth | Team details |
| PATCH | `/api/teams/:id` | Auth | Update team |
| DELETE | `/api/teams/:id` | Auth | Delete team |
| GET | `/api/teams/stats` | Auth | Team counts |
| POST | `/api/teams/:id/members` | Auth | Add workspace member |
| POST | `/api/teams/:id/invite` | Auth | Invite by email |
| DELETE | `/api/teams/:id/members/:userId` | Auth | Remove member |
| PATCH | `/api/teams/:id/members/:userId` | Auth | Change role |

### GET `/api/teams`

```json
// 200 OK
{
  "teams": [
    {
      "id": "team_1",
      "name": "Taskflow Core",
      "description": "Core product development",
      "color": "#6155DD",
      "ownerId": "u1",
      "members": [
        { "userId": "u1", "role": "admin", "joinedAt": "2026-06-03T00:00:00Z" }
      ],
      "pendingInvites": 0,
      "createdAt": "2026-06-03T00:00:00Z",
      "updatedAt": "2026-06-03T00:00:00Z"
    }
  ]
}
```

### POST `/api/teams`

```json
// Request
{ "name": "API Gateway", "description": "...", "color": "#E09D34" }

// 201 Created
{ "team": { "id": "team_3", "name": "API Gateway", ... } }
```

### GET `/api/teams/stats`

```json
// 200 OK
{ "totalTeams": 3, "totalMembers": 7, "pendingInvites": 1 }
```

### POST `/api/teams/:id/members`

```json
// Request
{ "userId": "u3" }
// 200 OK — returns updated team
```

### POST `/api/teams/:id/invite`

```json
// Request
{ "email": "newperson@example.com" }
// 201 Created — returns invitation
```

### PATCH `/api/teams/:id/members/:userId`

```json
// Request
{ "role": "admin" }
// 200 OK
```

---

## Tasks Service — `/api/tasks`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/tasks` | Auth | List tasks (filterable) |
| POST | `/api/tasks` | Auth | Create task |
| GET | `/api/tasks/:id` | Auth | Task detail |
| PATCH | `/api/tasks/:id` | Auth | Update task |
| DELETE | `/api/tasks/:id` | Auth | Delete task |
| GET | `/api/tasks/stats` | Auth | Status counts |

### GET `/api/tasks`

Query params:
- `assigneeId=me` — my tasks (or specific userId)
- `status=todo|in-progress|review|done`
- `priority=high|medium|low`
- `teamId=<id>`
- `projectId=<id>`
- `sprintId=<id>`
- `page=1&limit=20`

```json
// 200 OK
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

### POST `/api/tasks`

```json
// Request
{
  "title": "New task",
  "priority": "medium",
  "status": "todo",
  "label": "feature",
  "teamId": "team_1",
  "assigneeId": "u1",
  "dueDate": "2026-06-30",
  "description": "Optional markdown body"
}

// 201 Created
{ "task": { "id": "TF-008", ... } }
```

### GET `/api/tasks/stats`

Query params: `assigneeId=me`, `teamId=<id>` (optional)

```json
// 200 OK
{ "total": 7, "todo": 2, "inProgress": 2, "review": 2, "done": 1 }
```

---

## Board Service — `/api/board`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/board` | Auth | Tasks by column for a team |
| PATCH | `/api/board/move` | Auth | Move task between columns |

### GET `/api/board`

Query params:
- `teamId=<id>` (required)
- `sprintId=<id>` (optional)

```json
// 200 OK
{
  "columns": [
    {
      "id": "todo",
      "title": "To Do",
      "color": "#ABAAA5",
      "tasks": [ { "id": "TF-003", "title": "...", ... } ]
    },
    { "id": "in-progress", "title": "In Progress", "color": "#5B9CF6", "tasks": [] },
    { "id": "review",      "title": "Review",      "color": "#A78BFA", "tasks": [] },
    { "id": "done",        "title": "Done",         "color": "#32B173", "tasks": [] }
  ]
}
```

### PATCH `/api/board/move`

```json
// Request
{ "taskId": "TF-001", "newStatus": "review" }

// 200 OK
{ "task": { "id": "TF-001", "status": "review", "updatedAt": "..." } }
```

---

## Users Service — `/api/users`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/users` | Auth | List users (assignee picker) |
| GET | `/api/users/:id` | Auth | User profile |
| PATCH | `/api/users/:id` | Auth | Update own profile |

### PATCH `/api/users/:id`

```json
// Request
{ "name": "Arkabrata C.", "email": "arko@codeclouds.com", "title": "Senior Engineer" }

// 200 OK
{ "user": { "id": "u1", "name": "Arkabrata C.", ... } }

// 409 Conflict
{ "message": "This email is already in use by another account." }
```

---

## Projects Service — `/api/projects`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/projects` | Auth | User's projects |
| POST | `/api/projects` | Auth | Create project |
| GET | `/api/projects/:id` | Auth | Project details |
| GET | `/api/projects/:id/sprints` | Auth | List sprints |
| POST | `/api/projects/:id/sprints` | Auth | Create sprint |
| PATCH | `/api/projects/:id/sprints/:sprintId` | Auth | Update sprint |

---

## Preferences Service — `/api/preferences`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/preferences` | Auth | User preferences |
| PATCH | `/api/preferences` | Auth | Update preferences |

### GET `/api/preferences`

```json
// 200 OK
{
  "theme": "dark",
  "sidebarCollapsed": false,
  "defaultTaskFilter": "all",
  "notificationsEnabled": true
}
```

### PATCH `/api/preferences`

```json
// Request (partial)
{ "theme": "light" }

// 200 OK
{ "preferences": { "theme": "light", ... } }
```

---

## Notifications Service — `/api/notifications`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/notifications` | Auth | Unread notifications |
| PATCH | `/api/notifications/:id/read` | Auth | Mark one read |
| PATCH | `/api/notifications/read-all` | Auth | Mark all read |

---

## Activity Service — `/api/activity`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/activity` | Auth | Recent workspace activity |
| GET | `/api/activity/tasks/:taskId` | Auth | Activity for a task |

---

## Error Codes

| HTTP | When |
|---|---|
| 400 | Invalid request body or missing required field |
| 401 | No session cookie or expired session |
| 403 | Authenticated but not authorised (e.g. non-admin trying to delete a team) |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, already a member, etc.) |
| 500 | Unexpected server error |
| 502 | Cloudflare Worker — upstream MFE is unreachable |
