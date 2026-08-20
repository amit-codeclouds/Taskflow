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
| POST | `/api/auth/signup` | Public | Register — name + email + title + password + workspaceName → sets session cookies |
| POST | `/api/auth/login` | Public | Email + password → sets session cookies |
| POST | `/api/auth/logout` | Auth | Clears all session cookies |
| GET | `/api/auth/me` | Auth | Returns current user |
| GET | `/api/auth/me/stats` | Auth | Aggregate task stats for the current user. Consumed by `authService.meStats()` |
| GET | `/api/auth/me/settings` | Auth | Current user's settings (resolved server-side via the JWT `sub` claim). Consumed by `authService.meSettings()` |

### `POST /api/auth/signup`

Collected over a **2-step form** in the Shell: step 1 captures account credentials
(name, email, password), step 2 captures role + workspace. Both steps submit together
as a single request on final submit — there is no partial-signup API call.

**Request**
```json
{ "name": "string", "email": "string", "password": "string", "title": "string", "workspaceName": "string" }
```
`title` is the resolved designation — if the user selected "Other" on the form, the free-text value is sent here, never the string `"Other"`. `title` is required (step 2 cannot be submitted without a role selected).

`workspaceName` is required and defaults to `"<name>'s Workspace"` when the user reaches step 2 — the field is pre-filled and editable, with a note in the UI clarifying it is the default name and can be changed later. This becomes the `name` of the `Workspace` row auto-created for the new user (see `models.md`).

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
    { "workspaceId": "ws_1", "name": "Arkabrata Das's Workspace", "role": "owner", "status": "active", "joinedAt": "2026-06-01T00:00:00Z" }
  ],
  "teams": [
    { "teamId": "team_1", "workspaceId": "ws_1", "role": "admin",     "joinedAt": "2026-06-01T00:00:00Z" },
    { "teamId": "team_2", "workspaceId": "ws_1", "role": "developer", "joinedAt": "2026-06-05T00:00:00Z" }
  ]
}
```
`workspaces[]` and `teams[]` are the authoritative membership arrays on the User. All workspace and team access decisions are derived from these two arrays.

### `GET /api/auth/me/stats`
Aggregate stats for the current authenticated user.
**Response `200`**
```json
{
  "result": {
    "workspaceCount": 1,
    "teamCount": 3,
    "taskCount": {
      "activeTasks": 1,
      "archieveTask": 6
    }
  }
}
```
> Source: `shell/lib/types/auth.types.ts` (`MeStats`). Consumed by `authService.meStats()`.
> `archieveTask` spelling mirrors the backend. WelcomeScreen derives **Total Tasks** = `activeTasks + archieveTask`.

### `GET /api/auth/me/settings`
Fetches the authenticated user's settings — no `:id` needed, resolved from the JWT `sub` claim.
The response's `userId` is what the Shell then uses as the `:id` path param for
`PUT /api/users/:id/settings` below.
**Response `200`**
```json
{
  "result": {
    "userId": "8208e9b4-6d08-45fb-921e-65e6238e4ab6",
    "daysToArchieve": 2,
    "notificationOnMemberAddToWorkspace": false,
    "notificationOnMemberAddToTeam": false,
    "notificationOnTaskAssignment": false,
    "isTeamMemberNotificationEnabled": false,
    "isWorkspaceMemberNotificationEnabled": false,
    "isTaskCreationNotificationEnabled": false
  }
}
```
> Source: `shell/lib/types/users.types.ts` (`UserSettings`). Consumed by `authService.meSettings()` via `useMySettings()`.
> `daysToArchieve` spelling mirrors the backend. Number of days after which a task marked with an archived-designated status is moved to the archive table.
> The remaining six booleans back the **Notifications** section — `notificationOn*` fields fire when this user is added/assigned; `is*NotificationEnabled` fields fire when there's activity in a workspace/team/task this user created.

---

## OTP Service  `/api/otp`

> Backed by the .NET backend's Postman collection ("Taskflow DOTNET Backend" → Otp folder).
> Both endpoints are **anonymous** — no session cookie / bearer token required. Gates three
> flows in the Shell before the "real" mutation runs: Signup, Login → Forgot Password, and
> Settings → Change Password.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/otp/generate?platform={bool}` | Public | Generate + email a 6-digit OTP for `email` + `event` |
| POST | `/api/otp/verify` | Public | Verify a previously generated OTP for `email` + `event` |

### `POST /api/otp/generate`
**Query params**
```
platform=true|false   (required)
```
`platform` tells the backend whether the account already exists: **`false`** for
`event: "signup"` (the user isn't created yet), **`true`** for every other event
(`forgotpassword`, `changepassword`, `deleteaccount` all act on an existing account).
Derived automatically from `event` in `otpService.generate()` — callers never pass it directly.

**Request**
```json
{ "email": "user@example.com", "event": "signup", "description": "OTP for account signup verification" }
```
`event` is one of: `signup` | `forgotpassword` | `deleteaccount` | `changepassword`. `description` is optional, free text shown for logging/audit purposes.

**Response `200`** — no body payload needed by the frontend beyond success/failure.

### `POST /api/otp/verify`
**Request**
```json
{ "email": "user@example.com", "event": "signup", "otp": "123456" }
```
**Response `200`** — ✅ confirmed live (captured via DevTools Network tab for `event: "forgotpassword"`):
```json
{
  "status": true,
  "code": 200,
  "result": { "verified": true, "event": "forgotpassword" },
  "message": "OTP verified successfully.",
  "errors": [],
  "dev_message": "",
  "requestId": "",
  "timestamp": "2026-08-08T17:06:47.9875114Z"
}
```
**No `userId` is returned.** The account isn't identified by this call — see the
Forgot Password flow below for how the password reset resolves the account instead.

### Flow: Signup (OTP-gated)
1. User fills the 2-step Signup form and submits step 2.
2. Shell calls `POST /api/otp/generate` with `event: "signup"` — **not** `POST /api/auth/signup` directly.
3. On success, an OTP modal (6 boxes) opens. User enters the code and submits.
4. Shell calls `POST /api/otp/verify` with `event: "signup"`.
5. Only on verify success does the Shell call `POST /api/auth/signup` with the form payload collected in step 1.

### Flow: Login → Forgot Password
1. User clicks "Forgot password?" on the Login page and enters their email.
2. Shell calls `POST /api/otp/generate` with `event: "forgotpassword"`.
3. OTP modal opens; on verify, Shell calls `POST /api/otp/verify` with `event: "forgotpassword"`. The response confirms `verified: true` only — no account identifier.
4. A "set new password" modal opens (`newPassword` + `confirmPassword`). Submitting calls `PUT /api/users/change/password` with `{ email, newPassword, confirmPassword }` in the body and **no** `Authorization` header, since the user is never logged in during this flow.

### Flow: Settings → Change Password
1. User (already authenticated) clicks "Change password" in Settings → Security.
2. Shell calls `POST /api/otp/generate` with `event: "changepassword"` using the current user's email (from `GET /api/auth/me`).
3. OTP modal opens; on verify, Shell calls `POST /api/otp/verify` with `event: "changepassword"`.
4. A "set new password" modal opens. Submitting calls `PUT /api/users/change/password` with `{ email, newPassword, confirmPassword }` — same endpoint as the Forgot Password flow, using the current user's own email. The bearer token is attached automatically like any other authenticated call, but the backend identifies the account by `email` in the body either way.

> Source: `shell/lib/types/otp.types.ts`, `shell/lib/services/otp.service.ts`, `shell/components/Modals/OtpModal.tsx`, `shell/components/Modals/NewPasswordModal.tsx`, `shell/components/Modals/ForgotPasswordEmailModal.tsx`.

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
| GET | `/api/migrate/task/archived` | Auth | Archived tasks for a team (paginated). Query: `teamId`, `page`, `limit`, `statusId`, `search`. Powers the Board MFE **Archived Tasks** screen (`ArchivedTasklistComponent`, `TeamService.getArchivedTasks()`) and the Task MFE's **Archived** tab on `TeamTaskBoardScreen` (`/tasks/listview`, `archivedTasksService.list()`) |
| GET | `/api/migrate/task/archived/:taskId` | Auth | Single archived task detail. Powers the Board MFE **Archived Task Details** screen (`ArchivedTaskdetailsComponent`). Consumed by `TeamService.getArchivedTask()`. Not yet wired in the Task MFE — its Archived tab only lists, no detail drill-down yet |

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

### `GET /api/migrate/task/archived`
**Query params**
```
teamId=uuid            (required)
page=1&limit=10
statusId=uuid           (optional — filter by status)
search=string           (optional)
```
**Response `200`** — paginated list of archived tasks. Note: assignees arrive under
`assigneeDetails` (not `assignees`), each with `id` (not `userId`), and `avatarUrl` /
`avatarInitials` may be empty strings. `TeamService.getArchivedTasks()` unwraps the
list tolerantly (`{ result: { data } }` | `{ data }` | `{ result: [] }` | `[]`).
```json
{
  "data": [
    {
      "id": "2271b4e3-2b72-424a-8be3-d342981d90a2",
      "taskNumber": 1,
      "title": "Test Task",
      "description": null,
      "priority": "High",
      "label": null,
      "statusId": "530b9897-2332-4052-b906-5d24eb7a24cf",
      "teamId": "8b475c9a-4c87-4e9a-9f8b-74b4e5ed65db",
      "assigneeDetails": [
        { "id": "cfad9fc7-...", "name": "Kumbhakar Biswas", "avatarInitials": "", "avatarUrl": "" }
      ],
      "expectedCompletion": null,
      "progress": 0,
      "createdBy": "00000000-0000-0000-0000-000000000000",
      "deletedAt": null,
      "createdAt": "2026-07-11T05:13:04.365661Z",
      "updatedAt": "2026-07-11T05:41:21.56791Z"
    }
  ]
}
```

<details>
<summary>Superseded plan (kept for history — not the live contract)</summary>

The endpoints below were the original v1 plan (`/api/tasks/stats`, single `assigneeId`,
lowercase enums, embedded `status`/`team` objects, `imageUrls`). The live backend does not
implement them this way — see the confirmed shapes above instead.

</details>

---

## Comment Service  `/api/comments`

> Drives the Comments panel on **Task MFE**'s Task Detail page (`mfe-task/src/components/tasks/TaskDetailScreen.tsx`).
> Confirmed against the Postman collection ("Taskflow DOTNET Backend" → Comments folder), but no saved
> example response was attached there — the response shape below (embedded `author` object) reflects
> what was verbally confirmed, not a captured payload; field names should be re-checked against the
> live response and corrected here once available. See `mfe-task/src/lib/types/comments.types.ts`.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/comments?taskId=:taskId` | Auth | List comments on a task, oldest first. Requester must be a member of the task's team. |
| POST | `/api/comments?taskId=:taskId` | Auth | Add a comment to a task. Requester must be a member of the task's team. |
| PUT | `/api/comments/:commentId` | Auth | Edit a comment's body. Only the comment's author may update it. |
| DELETE | `/api/comments/:commentId` | Auth | Delete a comment. Only the comment's author may delete it. |

### `GET /api/comments`
**Query params**
```
taskId=uuid   (required)
```
**Response `200`** — array of comments, oldest first (field names unconfirmed — see note above):
```json
{
  "result": [
    {
      "id": "9b5e59b4-2f84-47c8-9790-576c4fc94ba2",
      "taskId": "e79c4b0f-9b10-4934-96ca-11442fd85bbe",
      "authorId": "uuid",
      "author": { "userId": "uuid", "name": "Alice Chen", "avatarInitials": "AC" },
      "body": "<p>This looks good, ready for review.</p>",
      "createdAt": "2026-07-17T18:00:00.000Z",
      "updatedAt": "2026-07-17T18:00:00.000Z"
    }
  ]
}
```

### `POST /api/comments`
**Query params**: `taskId=uuid` (required)
**Request**
```json
{ "body": "<p>This looks good, ready for review.</p>" }
```
**Response `200`** — the created Comment object (same shape as above).

### `PUT /api/comments/:commentId`
**Request**
```json
{ "body": "<p>This looks good, ready for review (edited).</p>" }
```
**Response `200`** — the updated Comment object.

### `DELETE /api/comments/:commentId`
**Response `200`** — empty result.

---

## Board Service  `/api/board`

> Drives the **Board MFE** (`mfe-board`) and, as of the Team Task List View feature, the
> **Task MFE**'s `TeamTaskBoardScreen` (`/tasks/listview?teamid=`, `mfe-task/src/lib/services/board.service.ts`).
> Statuses are dynamic per team — each team owns a `board_statuses` list. Tasks reference a status by id.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/tasks/team/:teamId/board` | Auth | Team's board — statuses + tasks. ✅ confirmed live path (returns 401 unauth). Confirmed response: `{ result: { teamId, columns: [{ id, name, description, position, totalTasks, isArchievable, isDeletable, tasks: [...full TaskResponseDto objects...] }] } }` — column `id` doubles as each task's `statusId`; embedded tasks match the same shape as `GET /api/tasks/my`/`:id` (including `createdAt`/`updatedAt`), no pagination per column. Consumed by `TeamService.getTeamBoard()` in mfe-board and `boardService.getTeamBoard()` in mfe-task. The `/api/board/:teamId` path below is **not** live (404) — kept for history |
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
| GET | `/api/people/invitations?userId=:userId` | Auth | Invitations addressed to a user. Consumed by `inviteService.listByUser()` (Shell Invite screen). ✅ endpoint live (401 unauth) |
| POST | `/api/people/invitations/accept` | Auth | Accept a workspace invitation. Body `{ workspaceId, userId }`. Consumed by `inviteService.accept()` (Invite screen Accept button) |
| POST | `/api/people/invitations/decline` | Auth | Reject a workspace invitation. Body `{ workspaceId, userId }`. Consumed by `inviteService.decline()` (Invite screen Reject button) |
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

### `GET /api/people/invitations`
**Query params**: `userId=uuid` (required)
**Response `200`** — invitations addressed to the user (envelope: `{ status, code, result }`).
```json
{
  "result": [
    {
      "id": "757a1f4c-cace-47ca-80b7-321d8261c2f4",
      "workspaceId": "2c6b8c4d-6ec8-4d45-9e79-2a09ada121a7",
      "workspaceName": "Arkabrata Chandra's Workspace",
      "invitedBy": "Arkabrata Chandra",
      "email": "ramit4863@gmail.com",
      "expiresAt": "2026-08-20T12:47:43.767358Z",
      "createdAt": "2026-08-13T12:47:43.76738Z"
    }
  ]
}
```
> Source: `shell/lib/types/invite.types.ts` (`Invitation`). `invitedBy` is the inviter's display name. Backs the Shell **Invite** screen (`/invite`, driven by the `wid`/`uid`/`event`/`action` link params).

---

## Workspace Service  `/api/workspace`

> Drives the **Shell** — Workspace Details screen (`shell/components/workspace/WorkspaceDetailsScreen.tsx`, route `/workspace/:id`).

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/workspace/:workspaceId/info` | Auth | Workspace details — owner, teams, members. Consumed by `workspaceService.info()`. ✅ endpoint live (401 unauth) |

### `GET /api/workspace/:workspaceId/info`
**Response `200`** — envelope `{ status, code, result }`.
```json
{
  "result": {
    "id": "53c912b0-7b07-434f-860c-3eecb765e116",
    "name": "Ramit Roy's Workspace",
    "ownerId": "4d3c04d0-54fb-44c8-a6b5-7ce574335f29",
    "createdAt": "2026-08-10T04:50:40.044589Z",
    "updatedAt": "2026-08-10T04:50:40.044715Z",
    "owner": { "id": "uuid", "name": "Ramit Roy", "email": "ramit4863@gmail.com", "title": "Team Lead", "avatarUrl": "https://…" },
    "teams": [ { "id": "uuid", "name": "Taskflow Team", "description": "", "color": "#E67E22" } ],
    "members": [ { "id": "uuid", "name": "Atanu Chakraborty", "email": "…", "title": "Engineer", "avatarUrl": null } ]
  }
}
```
> Source: `shell/lib/types/workspace.types.ts` (`WorkspaceDetails`). `owner.avatarUrl` / `members[].avatarUrl` may be a URL, `null`, or `""`.

---

## Team Service  `/api/teams`

> Drives the **Shell** — Teams section.
> - `shell/components/teams/TeamsScreen.tsx` — list + stats (`/teams`), Workspace Teams sub-nav
> - `shell/components/teams/AssignedTeamsScreen.tsx` — list of teams assigned outside the workspace (`/teams/assigned`), Assigned Teams sub-nav
> - `shell/app/(shell)/teams/new/page.tsx` — Create Team page (`/teams/new`)
> - `shell/app/(shell)/teams/[id]/page.tsx` — Manage Team page (`/teams/:id`)
> - AssignedTeamCard's "View Tasks" button cross-zone-links straight into Task MFE's `TeamTaskBoardScreen` (`/tasks/listview?teamid=`) — no placeholder page in Shell
> - `shell/components/teams/TeamInviteModal.tsx` — Invite by email (modal)
> - `shell/components/layout/Sidebar.tsx` — "Teams" sidebar item is an expandable accordion with two sub-links: Workspace Teams (`/teams`) and Assigned Teams (`/teams/assigned`)
>
> Teams are separate from Projects. A team groups users; a project groups tasks.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/teams` | Auth | List teams the current user belongs to |
| GET | `/api/teams?exclude_workspace=true` | Auth | List teams the current user is assigned to that are **outside** their own workspace |
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

### `GET /api/teams?exclude_workspace=true`
Same response shape as `GET /api/teams`, filtered to teams the current user is a member of that do **not** belong to their own workspace (i.e. teams they were added to via cross-workspace invite). Drives `AssignedTeamsScreen`. Team cards rendered from this response show a **View Tasks** action only — no Manage / Invite actions, since the current user is not an admin of these teams.

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
| GET | `/api/users/:id/settings` | Auth | Get a user's settings by id |
| PUT | `/api/users/:id/settings` | Auth | Update a user's settings. Consumed by `usersService.updateSettings()` |
| PUT | `/api/users/change/password` | Public\* | Change a password after OTP verification, identified by `email` in the body (not `:id`). Shared by Settings → Change Password and Login → Forgot Password. Consumed by `usersService.changePassword()` |

### `GET /api/users`
**Response `200`**
```json
{
  "data": [
    { "id": "uuid", "name": "Alice Chen", "email": "alice@...", "avatarInitials": "AC" }
  ]
}
```

### `PUT /api/users/:id/settings`
Updates the target user's settings. All fields are optional. `:id` is the current user's own
`userId` (taken from the `GET /api/auth/me/settings` response), never a `/api/auth/me` call.

`SettingsScreen` uses a single Formik form spanning the **Notifications** section (6 boolean
toggles, split into "Notifications for you" and "Notifications for your workspaces & teams")
and the **Task Archiving** section (`daysToArchieve` — the number of days after which a task
marked with an archived-designated status is moved to the archive table). One centralized
"Save settings" button submits all 7 fields together in a single request.

**Request**
```json
{
  "daysToArchieve": 2,
  "notificationOnMemberAddToWorkspace": true,
  "notificationOnMemberAddToTeam": true,
  "notificationOnTaskAssignment": true,
  "isWorkspaceMemberNotificationEnabled": false,
  "isTeamMemberNotificationEnabled": false,
  "isTaskCreationNotificationEnabled": false
}
```
**Response `200`**
```json
{
  "result": {
    "userId": "8208e9b4-6d08-45fb-921e-65e6238e4ab6",
    "daysToArchieve": 2,
    "notificationOnMemberAddToWorkspace": true,
    "notificationOnMemberAddToTeam": true,
    "notificationOnTaskAssignment": true,
    "isTeamMemberNotificationEnabled": false,
    "isWorkspaceMemberNotificationEnabled": false,
    "isTaskCreationNotificationEnabled": false
  }
}
```
> Source: `shell/lib/types/users.types.ts` (`UserSettings`, `UpdateUserSettingsPayload`). Consumed by `useUpdateUserSettings()` → `usersService.updateSettings()`.

### `PUT /api/users/change/password`
Changes a password after OTP verification. `newPassword` and `confirmPassword` must match
(6–100 characters). Identifies the account by `email` in the body rather than an `:id` path
param — `POST /api/otp/verify` confirmed live returns only `{ verified, event }`, no `userId`,
so this endpoint has to resolve the account itself. Shared by two flows:

- **Settings → Change Password** — after `POST /api/otp/verify` with `event: "changepassword"`. Caller is authenticated; the bearer token is attached automatically like any other call, but `email` is still the current user's own email (from `GET /api/auth/me`).
- **Login → Forgot Password** — after `POST /api/otp/verify` with `event: "forgotpassword"`. Caller is **not** authenticated — no `Authorization` header is sent, since the user hasn't logged in.

**Request**
```json
{ "email": "user@example.com", "newPassword": "NewSecret123", "confirmPassword": "NewSecret123" }
```
**Response `200`** — no payload needed by the frontend beyond success/failure.

> Source: `shell/lib/types/users.types.ts` (`ChangePasswordPayload`). Consumed by `usersService.changePassword()`.

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
| WelcomeScreen — 4 stat cards (Total Tasks, Archived Task, Total Team, Total Workspace) | `GET /api/auth/me/stats` via `useUserStats()` → `authService.meStats()`. Total Tasks = `taskCount.activeTasks + taskCount.archieveTask`, Archived Task = `taskCount.archieveTask`, Total Team = `teamCount`, Total Workspace = `workspaceCount`. No trend badges |
| WelcomeScreen — App showcase cards (Tasks, Board) | client navigation only — `<a>` cross-zone links |
| WelcomeScreen — Project Timeline phases | static / no API needed |
| TeamsScreen — 3 stat cards (Total Teams, Total Members, Pending Invites) | `GET /api/teams/stats` |
| TeamsScreen — team list | `GET /api/teams` |
| TeamsScreen — "New Team" button → navigates to `/teams/new` | (navigation only) |
| `/teams/new` — Create Team page submit (name + desc + color + member multi-select) | `POST /api/teams` (includes `color` + `memberIds[]`) |
| TeamCard — "Manage" button → navigates to `/teams/:id` | (navigation only) |
| Sidebar — "Teams" accordion → Workspace Teams / Assigned Teams sub-links | (navigation only) |
| AssignedTeamsScreen — assigned team list (`/teams/assigned`) | `GET /api/teams?exclude_workspace=true` |
| AssignedTeamCard — "View Tasks" button → cross-zone `<a href="/tasks/listview?teamid=...">` into Task MFE's `TeamTaskBoardScreen` | (navigation only — see Task MFE traceability below) |
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
| PeopleScreen — row "⋮" menu → "Resend invite" (pending member only) | `POST /api/people/invite` (re-send to same email → 200, resets expiry) |
| PeopleScreen — row "⋮" menu → "Remove" (active member) | `DELETE /api/people/:userId` |
| PeopleScreen — row "⋮" menu → "Cancel invite" (pending member) | `DELETE /api/people/:userId` |
| SettingsScreen — Profile (name, title) read | `GET /api/auth/me` |
| SettingsScreen — Profile save | `PATCH /api/users/:id` |
| WorkspaceDetailsScreen (`/workspace/:id`) — owner, teams list, members list | `GET /api/workspace/:workspaceId/info` via `workspaceService.info()` |
| SettingsScreen — Security section, "Change password" button | `POST /api/otp/generate` (`event: "changepassword"`) → OtpModal → `POST /api/otp/verify` → NewPasswordModal → `PUT /api/users/change/password` (`email` = current user's own email) |
| SettingsScreen — Notifications section (6 toggles, split "Notifications for you" / "Notifications for your workspaces & teams") + Task Archiving section ("Archive after N days" field), read | `GET /api/auth/me/settings` via `useMySettings()` → `authService.meSettings()` |
| SettingsScreen — single centralized "Save settings" button (one Formik form spanning both the Notifications and Task Archiving sections) | `PUT /api/users/:id/settings` via `useUpdateUserSettings()` → `usersService.updateSettings()`, submitting all 6 notification booleans + `daysToArchieve` in one request, `:id` = `userId` from the settings read response |
| `/chat` — ChatPage, full-bleed `<iframe>` embedding the external chatbot app (`NEXT_PUBLIC_CHATBOT_URL`, default `https://taskflow-chatbot-six.vercel.app`) | _no backend dependency — third-party origin owns its own API calls; nothing proxied through our gateway_ |
| Sidebar — "Chat" link (Workspace group) → `/chat` | (navigation only) |
| Sidebar — workspace indicator (workspace name) | `GET /api/auth/me` (`workspaces[0].name`) |
| Sidebar — user card (name, initials) | `GET /api/auth/me` |
| Topbar — bell icon | _commented out — not yet wired_ |
| Topbar — avatar | `GET /api/auth/me` |
| LoginForm — submit | `POST /api/auth/login` |
| LoginForm — "Forgot password?" link → ForgotPasswordEmailModal submit | `POST /api/otp/generate` (`event: "forgotpassword"`) |
| LoginForm — OtpModal verify (forgot-password flow) | `POST /api/otp/verify` (`event: "forgotpassword"`) |
| LoginForm — NewPasswordModal submit (forgot-password flow) | `PUT /api/users/change/password` (email in body, no bearer token) |
| SignupForm — step 1 "Continue" (name, email, password, confirm) | (client-side validation only, no API call) |
| SignupForm — step 2 "Create account" submit (title + workspaceName) | `POST /api/otp/generate` (`event: "signup"`) — **not** signup directly |
| SignupForm — OtpModal verify (signup flow) | `POST /api/otp/verify` (`event: "signup"`) → on success, `POST /api/auth/signup` with the full form payload |

### Task MFE (`mfe-task/`)

| Frontend element | Endpoint |
|---|---|
| TaskListScreen — task list ("My Tasks") | `GET /api/tasks/my` |
| TaskListScreen — search box | `GET /api/tasks/my?search=...` |
| TaskListScreen — team filter dropdown ("All Teams" + one option per team the user is assigned to, each option showing its member count) | `GET /api/teams?exclude_workspace=true` (options — teams the user is assigned to, matching `Sidebar`/`TaskFormScreen`/`TeamTaskBoardScreen`; `memberCount` derived client-side from the `members[]` array), `GET /api/tasks/my?teamId=...` (filter) |
| TaskListScreen — dynamic status tabs (shown once a single team is selected) | `GET /api/board-statuses/team/:teamId`; tab click filters the fetched page client-side by `statusId` |
| TaskListScreen — status badge on each row | resolved via `GET /api/board-statuses/team/:teamId` for the row's team (batched across the page's unique teams with `useBoardStatusesMap`) |
| TaskListScreen — pagination (Previous/Next) | `GET /api/tasks/my?page=...` |
| "New Task" button | navigates to `/new` (`?teamId=...` preserved if a team is selected) |
| Task row edit (✎) / open (↗) icons | navigate to `/:id/edit` and `/:id` (client-side — no API) |
| Task row progress (◔) icon → ProgressModal submit | `PUT /api/tasks/:id` via `useUpdateTask()` — body `{ progress }` only. Opens a modal with a progress slider (0–100, 5% steps); shown for the user's own tasks (same gating as Edit) |
| TaskFormScreen — Team dropdown | `GET /api/teams`; disabled when editing (team is immutable post-creation) |
| TaskFormScreen — Status dropdown (per team) | `GET /api/board-statuses/team/:teamId` |
| TaskFormScreen — Assignees multi-select | `GET /api/people` |
| TaskFormScreen — submit (create) | `POST /api/tasks` |
| TaskFormScreen — submit (edit) | `PUT /api/tasks/:id` (no `teamId` sent) |
| TaskDetailScreen — task data | `GET /api/tasks/:id` |
| TaskDetailScreen — status name, team name/color | `GET /api/board-statuses/team/:teamId`, `GET /api/teams` |
| TaskDetailScreen — Edit Task button | navigates to `/:id/edit` |
| TaskDetailScreen — Delete Task button (ConfirmProvider modal) | `DELETE /api/tasks/:id` |
| TaskDetailScreen — Comments panel, comment list | `GET /api/comments?taskId=:id` |
| TaskDetailScreen — CommentComposer submit | `POST /api/comments?taskId=:id` |
| TaskDetailScreen — CommentItem edit (own comment only) | `PUT /api/comments/:commentId` |
| TaskDetailScreen — CommentItem delete (own comment only, ConfirmProvider modal) | `DELETE /api/comments/:commentId` |
| Sidebar / Topbar — user card + workspace indicator | `GET /api/auth/me` (`workspaces[0].name` for the workspace indicator) |
| TeamTaskBoardScreen (`/tasks/listview?teamid=`) — status tabs + per-tab task list | `GET /api/tasks/team/:teamId/board` via `boardService.getTeamBoard()`; tabs come from `columns[]`, no separate board-statuses call |
| TeamTaskBoardScreen — task row Edit/Delete visibility | client-side only — `TaskRow` shows Edit + Delete for a task only when the signed-in user is one of its `assignees`; everyone else gets View only (no API) |
| TeamTaskBoardScreen — Archived tab (with tooltip explaining its purpose) | `GET /api/migrate/task/archived?teamId=&page=&limit=&search=` via `archivedTasksService.list()`; rows render read-only (no view/edit/delete — no archived-task detail page exists yet in Task MFE) |
| TeamTaskBoardScreen — Archived tab search + pagination | same endpoint, `search`/`page` query params |
| Entry point: Shell's AssignedTeamsScreen "View Tasks" button | cross-zone `<a href="/tasks/listview?teamid=...">` (navigation only) |

> Not yet wired in this pass (no UI surface added for them): `GET /api/tasks` (all-teams/assignee-filtered view), `PATCH /api/tasks/:id/status` (drag-drop — Board MFE concern), `GET /api/notifications`, `GET /api/migrate/task/archived/:taskId` (archived task detail).

### Board MFE (`mfe-board/`)

| Frontend element | Endpoint |
|---|---|
| DashboardComponent (`/board` landing) — "My Boards" team cards | `GET /api/teams` via `BoardService.getTeams()` — returns `ApiTeam[]`. Card assignees come from `members[].avatarInitials`; the To Do / In Progress / Done counts and total come from each team's `statusTaskCounts`. No static data |
| Topbar team-switcher dropdown (Board MFE only) | `GET /api/teams` |
| Kanban columns + tasks (BoardComponent) | `GET /api/tasks/team/:teamId/board` via `TeamService.getTeamBoard()` — response mapped to columns/tasks in the component; no static data |
| Column header status description tooltip (BoardComponent) | `GET /api/tasks/team/:teamId/board` — `columns[].description` shown on hover/focus of each status title (info icon). No extra request |
| Board assignee filter (BoardComponent) — multi-select of workspace people | `GET /api/people` via `PeopleService.getPeople()` for the list; selecting user(s) refetches `GET /api/tasks/team/:teamId/board?assigneeId=<ids>` (comma-separated for multiple: `?assigneeId=222,333,555`) via `TeamService.getTeamBoard(teamId, assigneeIds)` |
| Column "Load more" tasks | `GET /api/board/:teamId/status/:statusId/tasks?page&limit` |
| "+ Add Status" modal submit (dashboard card → CreateStatusComponent) | `POST /api/board-statuses/create` via `TeamService.createStatus()` — body `{ name, description, teamId, isArchievable }`. `position` is **not** sent: the field was removed from the modal, so the server must assign the column order. ✅ confirmed live (401 unauth) |
| Edit status (✎) modal submit | `PATCH /api/board/:teamId/statuses/:statusId` |
| Delete status (🗑, board column header → confirmation modal) | `DELETE /api/board-statuses/:statusId` via `TeamService.deleteStatus()`, then refetch the board. ✅ confirmed live (401 unauth) |
| Drag task to another column | `PATCH /api/tasks/:id/status` via `TeamService.updateTaskStatus(taskId, statusId)` — body `{ statusId }`. ✅ confirmed live (PATCH → 401 unauth; PUT/POST → 405) |
| "+ Add Task" button per column | navigates to `/tasks/new?teamId=&statusId=` → `POST /api/tasks` |
| "Archived Task" button per team card (DashboardComponent) | navigates to `/archived/:teamId` (Angular router, same zone) |
| Archived Tasks table (ArchivedTasklistComponent) — Task # / Title / Priority / Assignee | `GET /api/migrate/task/archived?teamId=&page=&limit=&statusId=&search=` via `TeamService.getArchivedTasks()`. Assignee cell shows `assigneeDetails[].avatarUrl` (fallback initials) with the name on hover |
| Archived Tasks table — "View Task" eye icon per row | navigates to `/archived-task/:taskId` (Angular router, same zone) → `ArchivedTaskdetailsComponent` |
| Archived Task Details (ArchivedTaskdetailsComponent) — number, title, priority, label, progress, dates, assignees, description | `GET /api/migrate/task/archived/:taskId` via `TeamService.getArchivedTask()`. Description rendered from CKEditor HTML via `[innerHTML]` |
| Task card "↗" open icon | navigates to `/tasks/:id` |
| Sidebar — user card + workspace indicator | `GET /api/auth/me` (`workspaces[0].name` for the workspace indicator) |
| Topbar — notification bell | `GET /api/notifications` |

> **CORS / same-origin proxy**: the Board MFE calls all backend endpoints as relative `/api/*`
> paths (never the absolute backend origin), so requests stay same-origin and never trigger CORS.
> In `ng serve` the Angular dev proxy (`mfe-board/proxy.conf.json`) forwards `/api` →
> `https://taskflowbackend-50mh.onrender.com`; in the worker path, the Cloudflare Worker routes
> `/api/*` → `GATEWAY_URL`. Point `GATEWAY_URL` at the real backend origin for the worker path.
