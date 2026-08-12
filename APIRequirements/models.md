# Data Models

> PostgreSQL source of truth for the TaskFlow backend.
> Derived from frontend type definitions and schema design sessions.
> Update this file whenever a new screen or feature introduces new fields.
> MongoDB collections (ActivityLog, Notification, UserPreferences) are omitted for v1.

---

## Core Enums

```ts
// Backend enums are PascalCase (confirmed against the live swagger — see
// mfe-task/src/lib/types/tasks.types.ts).
type Priority = 'High' | 'Medium' | 'Low';

type LabelType =
  | 'Feature'
  | 'Bug'
  | 'Design'
  | 'Docs'
  | 'Infra'
  | 'Refactor';

type WorkspaceMemberStatus = 'active' | 'pending';

type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

type TeamRole = 'admin' | 'pm' | 'tl' | 'developer';
```

---

## User

```ts
interface User {
  id: string;               // UUID — PK
  name: string;
  email: string;            // UNIQUE
  title: string;            // job title, e.g. "Engineer". Empty string if not set.
  designation?: string;     // optional designation / seniority label
  avatar_url?: string;      // Cloudinary secure URL
  avatar_public_id?: string;// Cloudinary public_id — required to delete the image
  created_at: string;       // ISO 8601
  updated_at: string;
}
```

> On user creation, a default **Workspace** is automatically created and assigned to this user as owner.

---

## MeStats (API response shape — `GET /api/auth/me/stats`)

> Aggregate stats for the current user.
> Source: `shell/lib/types/auth.types.ts` (`MeStats`).

```ts
interface MeStats {
  workspaceCount: number;
  teamCount: number;
  taskCount: {
    activeTasks: number;
    archieveTask: number;  // spelling mirrors the backend response
  };
}
```

> WelcomeScreen stat cards: **Total Tasks** = `activeTasks + archieveTask`,
> **Archived Task** = `archieveTask`, **Total Team** = `teamCount`,
> **Total Workspace** = `workspaceCount`.

---

## UserSettings (API response shape — `GET /api/auth/me/settings`, `PUT /api/users/:id/settings`)

> Per-user archiving + notification preferences. `userId` is the owning user's id — used as
> the `:id` path param when saving via `PUT /api/users/:id/settings`.
> Source: `shell/lib/types/users.types.ts` (`UserSettings`, `UpdateUserSettingsPayload`).

```ts
interface UserSettings {
  userId: string;
  daysToArchieve: number;  // spelling mirrors the backend response
  // "Notify me when..." — actions taken on this user (they're added/assigned)
  notificationOnMemberAddToWorkspace: boolean;
  notificationOnMemberAddToTeam: boolean;
  notificationOnTaskAssignment: boolean;
  // "Notify me when..." — activity inside workspaces/teams/tasks this user created
  isWorkspaceMemberNotificationEnabled: boolean;
  isTeamMemberNotificationEnabled: boolean;
  isTaskCreationNotificationEnabled: boolean;
}

// All fields optional. In practice the Shell submits all 7 together — one
// Formik form spans both sections, saved via a single centralized button.
interface UpdateUserSettingsPayload {
  daysToArchieve?: number;
  notificationOnMemberAddToWorkspace?: boolean;
  notificationOnMemberAddToTeam?: boolean;
  notificationOnTaskAssignment?: boolean;
  isWorkspaceMemberNotificationEnabled?: boolean;
  isTeamMemberNotificationEnabled?: boolean;
  isTaskCreationNotificationEnabled?: boolean;
}
```

> Drives two sections on `SettingsScreen`, both saved together via one centralized
> "Save settings" button (single Formik form, single `PUT` request):
> - **Notifications** — split into "Notifications for you" (`notificationOn*` fields — the
>   user is the one being added/assigned) and "Notifications for your workspaces & teams"
>   (`is*NotificationEnabled` fields — the user is the creator/owner of the workspace, team,
>   or task the activity happens in).
> - **Task Archiving** — the number of days after which a task marked with an
>   archived-designated status is moved to the archive table.

---

## Otp (API request/response shapes — `POST /api/otp/generate`, `POST /api/otp/verify`)

> Not a persisted model on the frontend — documents the request/response contract for the
> OTP-gated Signup, Forgot Password, and Change Password flows.
> Source: `shell/lib/types/otp.types.ts`.

```ts
type OtpEvent = 'signup' | 'forgotpassword' | 'deleteaccount' | 'changepassword';

interface GenerateOtpPayload {
  email: string;
  event: OtpEvent;
  description?: string;
}

interface VerifyOtpPayload {
  email: string;
  event: OtpEvent;
  otp: string;
}

interface VerifyOtpResult {
  verified?: boolean;
  event?: OtpEvent;
}
```

> ✅ Confirmed live for `event: "forgotpassword"` — the response contains **no `userId`**.
> Password changes therefore resolve the account by email (`ChangePasswordPayload` below)
> rather than by id.

---

## ChangePasswordPayload (API request shape — `PUT /api/users/change/password`)

> Identifies the account by `email` in the body rather than an `:id` path param. Shared by
> both password-change flows: **Settings → Change Password** (authenticated — bearer token
> sent, `email` is the current user's own) and **Login → Forgot Password** (anonymous — no
> bearer token, `email` is whatever the user entered on the login page).
> Source: `shell/lib/types/users.types.ts`.

```ts
interface ChangePasswordPayload {
  email: string;
  newPassword: string;     // 6-100 characters
  confirmPassword: string; // must match newPassword
}
```

> Both password models are called after OTP verification. Signup does **not** use either —
> it calls `POST /api/auth/signup` instead. See `api-endpoints.md`'s OTP Service section for
> the full flow.

---

## Workspace

```ts
interface Workspace {
  id: string;         // UUID — PK
  name: string;       // e.g. "<User>'s Workspace"
  owner_id: string;   // FK → User.id — set on creation, auto-assigned
  created_at: string;
  updated_at: string;
}
```

> A workspace is auto-created for every new user. `name` is user-supplied at signup (step 2 of `SignupForm`, field `workspaceName`) and pre-filled with the default `"<name>'s Workspace"` — not server-generated. Multi-workspace support is a future scope — the table is already structured for it.

---

## WorkspaceMember

> Join table tracking which users belong to which workspace.
> Source of truth for workspace-level access control.

```ts
interface WorkspaceMember {
  id: string;           // UUID — PK
  workspace_id: string; // FK → Workspace.id
  user_id: string;      // FK → User.id
  status: WorkspaceMemberStatus; // 'active' | 'pending'
  joined_at: string;    // ISO 8601 — null until invite accepted
}
```

---

## WorkspaceInvitation

> Sent from the People screen to invite a user to a workspace.
> On acceptance: inserts a row into WorkspaceMember with status = 'active'.

```ts
interface WorkspaceInvitation {
  id: string;           // UUID — PK
  workspace_id: string; // FK → Workspace.id
  invited_by: string;   // FK → User.id
  email: string;        // recipient email (may not be a registered user yet)
  status: InvitationStatus;
  expires_at: string;   // ISO 8601 — 7 days from creation
  created_at: string;
  updated_at: string;
}
```

---

## Role

> Global role definitions — not scoped per workspace.
> Predefined roles: Admin, PM, TL, Developer.
> `permissions` is a string array of permission keys, e.g. `["task:create", "task:delete"]`.

```ts
interface Role {
  id: string;              // UUID — PK
  name: string;            // UNIQUE — e.g. 'admin' | 'pm' | 'tl' | 'developer'
  description?: string;
  permissions: string[];   // array of permission key strings
  created_at: string;
  updated_at: string;
}
```

---

## Team

```ts
interface Team {
  id: string;           // UUID — PK
  name: string;
  description?: string;
  color: string;        // hex accent — e.g. "#6155DD", from TEAM_COLORS preset
  workspace_id: string; // FK → Workspace.id
  admin_id: string;     // FK → User.id — current admin (can change)
  created_by: string;   // FK → User.id — original creator (immutable)
  created_at: string;
  updated_at: string;
}
```

> On team creation, three default **BoardStatus** rows are seeded automatically by the backend:
> - `Backlog` (position 1)
> - `In Progress` (position 2)
> - `Done` (position 3)

---

## TeamRoleMapper

> Replaces the former TeamMembership table.
> Tracks which user belongs to which team and with which role.

```ts
interface TeamRoleMapper {
  id: string;      // UUID — PK
  team_id: string; // FK → Team.id
  user_id: string; // FK → User.id
  role_id: string; // FK → Role.id
  created_at: string;
}
```

---

## TeamInvitation

> Sent from the Teams screen to invite a user to a specific team with a pre-assigned role.
> On acceptance: inserts a row into TeamRoleMapper with the specified role_id.

```ts
interface TeamInvitation {
  id: string;         // UUID — PK
  team_id: string;    // FK → Team.id
  invited_by: string; // FK → User.id
  email: string;      // recipient email (may not be a registered user yet)
  role_id: string;    // FK → Role.id — role to assign on acceptance
  status: InvitationStatus;
  expires_at: string; // ISO 8601 — 7 days from creation
  created_at: string;
  updated_at: string;
}
```

> **Distinction**: `TeamInvitation` is team-scoped (Teams screen). `WorkspaceInvitation` is workspace-scoped (People screen). Accepting a workspace invite adds the user as a workspace member with no team; they can be added to teams separately.

---

## BoardStatus

> Statuses are fully dynamic per team. Each team owns its own ordered list of board columns.
> Three default statuses (Backlog, In Progress, Done) are seeded on team creation.

```ts
interface BoardStatus {
  id: string;           // UUID — PK
  team_id: string;      // FK → Team.id
  name: string;         // e.g. "Backlog", "In Progress", "Done"
  description?: string;
  position: number;     // column order — integer, 1-indexed
  created_at: string;
  updated_at: string;
}
```

> `GET /api/board-statuses/team/:teamId` (used by the Task MFE to populate the status
> dropdown and per-team status tabs) returns a lean catalog projection, not the full row:
> `{ statusId: string; statusName: string }[]`. See `mfe-task/src/lib/types/boardStatus.types.ts`.

---

## Task

> No Sprint or Project concept in v1.
> `description` stores CKEditor HTML output as a string.
>
> Source: `mfe-task/src/lib/types/tasks.types.ts` (`ApiTask`) — matches the live
> `TaskResponseDto` swagger contract, which differs from the earlier plan below in a
> few ways: `id` is a UUID (not a friendly code) with a separate numeric `taskNumber`
> for display, `label` is optional, and assignees come back inline as
> `assignees: AssigneeSummary[]` rather than requiring a join-table fetch.

```ts
interface Task {
  id: string;                   // UUID — PK
  taskNumber: number;           // sequential, human-friendly display id (e.g. "#42")
  title: string;
  description?: string;         // CKEditor HTML string (may contain embedded images)
  priority: Priority;           // 'High' | 'Medium' | 'Low'
  label?: LabelType;            // single label per task, optional
  statusId: string;             // FK → BoardStatus.statusId (team-scoped)
  teamId: string;                // FK → Team.id — required, immutable after creation
                                 // (UpdateTaskRequestDto has no teamId field)
  assignees: AssigneeSummary[]; // returned inline — no separate fetch needed
  expectedCompletion?: string;  // ISO 8601 date
  progress: number;             // integer 0–100, manual, defaults to 0
  createdBy: string;            // FK → User.id
  createdAt: string;
  updatedAt: string;
}

interface AssigneeSummary {
  userId: string;
  name?: string;
  avatarInitials?: string;
  avatarUrl?: string;
}
```

---

## ArchivedTask (API response shape — `GET /api/migrate/task/archived`)

> Source: `mfe-board/src/app/shared/interfaces/board.interface.ts` (`ApiArchivedTask`).
> Same core fields as `Task`, but the archived-list payload nests assignees under
> `assigneeDetails` (not `assignees`), and each uses `id` (not `userId`). Empty
> `avatarUrl` / `avatarInitials` arrive as `""` rather than being absent.

```ts
interface ApiArchivedTask {
  id: string;                        // UUID
  taskNumber?: number;               // display id (e.g. "#42")
  title: string;
  description?: string | null;
  priority?: string | null;          // 'High' | 'Medium' | 'Low'
  label?: string | null;
  statusId?: string;
  teamId?: string;
  assigneeDetails?: ArchivedAssignee[];
  expectedCompletion?: string | null;
  progress?: number;
}

interface ArchivedAssignee {
  id: string;                        // FK → User.id (note: `id`, not `userId`)
  name: string;
  avatarInitials?: string;           // may be ""
  avatarUrl?: string;                // may be ""
}
```

---

## TaskAssigneeMapper

> A task can be assigned to multiple users.
> Replaces the single `assignee_id` field on Task.

```ts
interface TaskAssigneeMapper {
  id: string;      // UUID — PK
  task_id: string; // FK → Task.id
  user_id: string; // FK → User.id
  created_at: string;
  updated_at: string;
}
```

---

## Comment

> Comments on a task. Corrected against the live Postman collection ("Taskflow DOTNET Backend" →
> Comments folder) and `database-schema.md`'s `comments` table — no image/attachment columns exist,
> superseding the earlier Cloudinary-attachment plan below. `author` is an embedded summary of the
> commenting user (verbally confirmed, not captured from a saved example response — field names may
> need correction once a live response is checked).
> Source: mfe-task/src/lib/types/comments.types.ts

```ts
interface Comment {
  id: string;             // UUID — PK
  task_id: string;        // FK → Task.id
  author_id: string;      // FK → User.id
  author?: {               // embedded author summary
    userId: string;
    name?: string;
    avatarInitials?: string;
    avatarUrl?: string;
  };
  body: string;            // comment text (HTML from the compact rich-text editor)
  created_at: string;
  updated_at: string;
}
```

---

## BoardColumn (API response shape — not persisted)

`GET /api/board/:teamId` returns columns built from BoardStatus rows plus paginated tasks.

```ts
interface BoardColumn {
  id: string;           // BoardStatus.id
  name: string;
  description?: string;
  position: number;
  total_tasks: number;  // total count in this status
  tasks: Task[];        // first 5 by default; paginated via "load more"
}
```

---

## Removed in v1

The following models from the original spec are **intentionally omitted** for v1:

| Model | Reason |
|---|---|
| `Sprint` | No sprint concept in v1 |
| `Project` | No project concept in v1 |
| `ActivityLog` | MongoDB — deferred |
| `Notification` | MongoDB — deferred |
| `UserPreferences` | MongoDB — deferred |
| `DashboardStats` | Computed at query time, not persisted |
| `Session` | Cookie-based, managed server-side |