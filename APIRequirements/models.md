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

## User

```ts
interface User {
  id: string;           // UUID
  name: string;
  email: string;
  avatarInitials: string; // e.g. "AC" — derived from name on creation
  avatarUrl?: string;
  createdAt: string;    // ISO 8601
  updatedAt: string;
}
```

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
> A WorkspaceMember is any user (active or pending invite) who has access to the workspace,
> regardless of which teams they belong to. Used by the People screen and the Teams invite form.

```ts
type MemberStatus = 'active' | 'pending';

interface WorkspaceMember {
  id: string;             // FK → User.id (null if invite not yet accepted)
  initials: string;       // e.g. "AC" — derived from name
  name: string;
  email: string;
  title: string;          // job title or role description; "—" if unknown
  teamIds: string[];      // FK → Team.id[] — teams this member belongs to
  status: MemberStatus;
}
```

---

## Team

> Source: `shell/components/teams/TeamsScreen.tsx`

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

---

## Invitation

> Source: `TeamsScreen` — InviteForm sends email to invite a user to a team.

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
