# Data Models

> Derived from current frontend type definitions across `shell`, `mfe-task`, and `mfe-board`.
> Kept as TypeScript interfaces so both frontend and backend can share them.
> Update this file whenever a new frontend screen introduces new fields.

---

## Core Enums

```ts
type Priority = 'high' | 'medium' | 'low';

// Board statuses are now dynamic per team (see BoardStatus below).
// No global TaskStatus enum exists — a task references a status by id.

type LabelType =
  | 'feature'
  | 'bug'
  | 'design'
  | 'docs'
  | 'infra'
  | 'refactor';
```

---

## WorkspaceMembership / TeamMembership

> These two embedded arrays live on every `User` document. They are the DB source of truth for access control.
> `WorkspaceMember` (People screen) and `Team.members` (Teams screen) are **derived views** built from these arrays.

```ts
interface WorkspaceMembership {
  workspaceId: string;       // FK → Workspace.id
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'pending';
  joinedAt: string;          // ISO 8601 — null if invite not yet accepted
}

interface TeamMembership {
  teamId: string;            // FK → Team.id
  workspaceId: string;       // FK → Workspace.id — scopes team to workspace
  role: TeamRole;            // 'admin' | 'pm' | 'tl' | 'developer'
  joinedAt: string;          // ISO 8601
}
```

---

## User

```ts
interface User {
  id: string;                // UUID
  name: string;
  email: string;
  title: string;             // designation — e.g. "Engineer", "Designer". Empty string if not set.
  avatarInitials: string;    // e.g. "AC" — derived from name on creation
  avatarUrl?: string;
  workspaces: WorkspaceMembership[];  // every workspace this user belongs to (active or pending)
  teams: TeamMembership[];            // every team membership, across all workspaces
  createdAt: string;         // ISO 8601
  updatedAt: string;
}
```

> **Derived views from these arrays:**
> - `WorkspaceMember` (People screen) = `User.workspaces[workspaceId === current]` + `teamIds` = `User.teams[workspaceId === current].map(t => t.teamId)`
> - `Team.members` (Teams screen) = all Users where `User.teams` contains `{ teamId: team.id, workspaceId: current }`

---

## Task

> Source: `mfe-task/src/components/tasks/TaskListScreen.tsx`

```ts
interface Task {
  id: string;                  // e.g. "TF-001"
  title: string;
  description?: string;        // rich-text (HTML/markdown)
  priority: Priority;
  statusId: string;            // FK → BoardStatus.id (team-scoped, dynamic)
  status?: BoardStatus;        // populated on fetch
  label: LabelType;
  assigneeId: string;          // FK → User.id
  assignee?: User;
  teamId: string;              // FK → Team.id — required
  team?: Team;
  expectedCompletion?: string; // ISO 8601 date. Renamed from `dueDate`.
  progress: number;            // integer 0–100, manual, defaults to 0
  imageUrls: string[];         // Cloudinary secure URLs, multi-upload
  projectId?: string;
  sprintId?: string;
  deletedAt?: string | null;   // soft-delete; set when parent status is deleted
  createdAt: string;
  updatedAt: string;
}
```

---

## Project

```ts
interface Project {
  id: string;
  name: string;
  slug: string;         // e.g. "taskflow" → task IDs prefixed "TF-"
  ownerId: string;      // FK → User.id
  members: User[];
  createdAt: string;
  updatedAt: string;
}
```

---

## Sprint

```ts
interface Sprint {
  id: string;
  name: string;         // e.g. "Sprint 1"
  projectId: string;    // FK → Project.id
  status: 'planning' | 'active' | 'completed';
  startDate: string;    // ISO 8601
  endDate: string;      // ISO 8601
  createdAt: string;
  updatedAt: string;
}
```

---

## BoardStatus

> Statuses are fully dynamic per team. Each team owns its own ordered list of statuses.

```ts
interface BoardStatus {
  id: string;           // UUID
  teamId: string;       // FK → Team.id
  name: string;         // e.g. "Backlog", "In Progress"
  description?: string;
  position: number;     // column order
  createdAt: string;
  updatedAt: string;
}
```

## BoardColumn (API response shape — not persisted)

`GET /api/board/:teamId` returns columns built from BoardStatus rows plus the first 5 tasks each.

```ts
interface BoardColumn {
  id: string;           // BoardStatus.id
  name: string;
  description?: string;
  position: number;
  totalTasks: number;   // total count in this status
  tasks: Task[];        // first 5 by default; paginated via "load more"
}
```

---

## WorkspaceMember

> Source: `shell/lib/workspace.ts` — workspace-level people directory.  
> **Derived view** — not a stored collection. Built by the backend from `User.workspaces` + `User.teams`
> filtered to the current workspace. Used by the People screen and the Teams invite member-picker.

```ts
type MemberStatus = 'active' | 'pending';

interface WorkspaceMember {
  id: string;             // FK → User.id (null if invite not yet accepted)
  initials: string;       // e.g. "AC" — derived from name
  name: string;
  email: string;
  title: string;          // job title or role description; "—" if unknown
  teamIds: string[];      // FK → Team.id[] — derived from User.teams[workspaceId === current]
  status: MemberStatus;   // derived from User.workspaces[workspaceId === current].status
}
```

---

## Team

> Source: `shell/lib/teams.ts`

Two shapes exist: one for the **backend API** (normalised) and one for the **frontend display** (denormalised, used by TeamsScreen, `/teams/new`, `/teams/:id`).

### Backend (API) shape

```ts
// Per-team role. See PRD/04-teams.md for the full permission matrix.
type TeamRole = 'admin' | 'pm' | 'tl' | 'developer';

interface TeamMember {
  userId: string;         // FK → User.id
  user?: User;            // populated on fetch
  role: TeamRole;
  joinedAt: string;       // ISO 8601
}

interface Team {
  id: string;             // e.g. "team_1"
  name: string;
  description: string;
  color: string;          // hex accent — display only, e.g. "#6155DD"
  ownerId: string;        // FK → User.id (always admin)
  members: TeamMember[];
  pendingInvites: number; // count of outstanding invitations
  createdAt: string;
  updatedAt: string;
}
```

### Frontend (display) shape

Used client-side in `teamsStore`, the Create Team page, and the Manage Team page.
Members are denormalised — all display fields are inlined; no separate `user` fetch needed.

```ts
interface TeamMember {
  id: string;             // FK → User.id
  initials: string;       // e.g. "AC" — for avatar display
  name: string;
  email: string;
  title: string;          // job title or "—" if unknown
  role: TeamRole;
  isPending: boolean;     // true = email-invited, not yet accepted
}

interface Team {
  id: string;
  name: string;
  description: string;
  color: string;          // hex — from TEAM_COLORS preset swatches
  members: TeamMember[];  // pending count derived via members.filter(m => m.isPending).length
}
```

---

## Invitation

> Source: `shell/components/teams/TeamInviteModal.tsx` — sends email to invite a user to a **team**.

```ts
type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

interface Invitation {
  id: string;
  teamId: string;         // FK → Team.id
  invitedBy: string;      // FK → User.id
  email: string;          // recipient email (may not be a registered user yet)
  status: InvitationStatus;
  expiresAt: string;      // ISO 8601 — 7 days from creation
  createdAt: string;
  updatedAt: string;
}
```

---

## WorkspaceInvitation

> Source: `PeopleScreen` — InviteModal sends email to invite a user to the **workspace** (not a specific team).

```ts
interface WorkspaceInvitation {
  id: string;
  workspaceId: string;    // FK → Workspace.id (future)
  invitedBy: string;      // FK → User.id
  email: string;
  status: InvitationStatus; // 'pending' | 'accepted' | 'declined' | 'expired'
  expiresAt: string;      // ISO 8601 — 7 days from creation
  createdAt: string;
  updatedAt: string;
}
```

> **Distinction**: `Invitation` is team-scoped (used by `TeamsScreen`). `WorkspaceInvitation` is workspace-scoped (used by `PeopleScreen`). Accepting a workspace invite makes the user a workspace member with no team; they can be added to teams afterward.

---

## Dashboard Stats

> Source: `shell/components/home/WelcomeScreen.tsx` — stat cards row.

```ts
interface DashboardStats {
  totalTasks: number;     // all tasks visible to current user
  inProgress: number;     // tasks with status = 'in-progress'
  completed: number;      // tasks with status = 'done'
  boardItems: number;     // tasks in the active sprint on the board
  // trend fields (computed, not stored):
  completionRate: number; // completed / totalTasks * 100
}
```

---

## Comment

```ts
interface Comment {
  id: string;
  taskId: string;       // FK → Task.id
  authorId: string;     // FK → User.id
  author?: User;
  body: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## Activity Log (MongoDB)

```ts
interface ActivityLog {
  _id: string;
  entityType: 'task' | 'project' | 'sprint' | 'comment';
  entityId: string;
  actorId: string;      // User.id
  action: string;       // e.g. "status_changed", "assignee_updated", "comment_added"
  diff: Record<string, { from: unknown; to: unknown }>;
  timestamp: string;    // ISO 8601
}
```

---

## Notification (MongoDB)

```ts
interface Notification {
  _id: string;
  recipientId: string;  // User.id
  type: 'task_assigned' | 'comment_added' | 'due_soon' | 'status_changed';
  payload: Record<string, unknown>; // varies by type
  read: boolean;
  createdAt: string;
}
```

---

## UserPreferences (MongoDB)

```ts
interface UserPreferences {
  _id: string;          // equals User.id
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  defaultTaskFilter: TaskStatus | 'all';
  notificationsEnabled: boolean;
  // extend freely — no migration needed (MongoDB)
}
```

---

## Session (cookie-based)

```ts
interface Session {
  userId: string;
  email: string;
  expiresAt: string;    // ISO 8601
}
// Stored server-side; client holds only the signed httpOnly cookie "taskflow_session"
```
