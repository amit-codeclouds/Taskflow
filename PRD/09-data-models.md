# Data Models

All TypeScript interfaces and enums used across the Taskflow frontend and specified in `APIRequirements/models.md`.

---

## Enums

```ts
type Priority = 'high' | 'medium' | 'low';

type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

type LabelType = 'feature' | 'bug' | 'design' | 'docs' | 'infra' | 'refactor';

type MemberStatus = 'active' | 'pending';

type TeamRole = 'admin' | 'member';

type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';
```

---

## Core Entities

### User

Stored in PostgreSQL `users` table.

```ts
interface User {
  id: string;              // UUID
  name: string;
  email: string;
  avatarInitials: string;  // auto-computed, e.g. "AC" from "Arkabrata C."
  avatarUrl?: string;      // optional uploaded image URL
  createdAt: string;       // ISO 8601
  updatedAt: string;
}
```

---

### WorkspaceMember

A view over `users` enriched with workspace-specific fields.

```ts
interface WorkspaceMember {
  id: string;              // = User.id
  initials: string;
  name: string;
  email: string;
  title: string;           // job title, e.g. "Engineer"
  teamIds: string[];       // all teams this person belongs to
  status: MemberStatus;    // 'active' | 'pending'
}
```

> Source: `shell/src/lib/workspace.ts`

---

### Team

Stored in PostgreSQL `teams` table. Members come from `team_members`.

```ts
interface Team {
  id: string;              // e.g. "team_1"
  name: string;
  description: string;
  color: string;           // hex colour, e.g. "#6155DD"
  ownerId: string;         // FK → User.id
  members: TeamMember[];
  pendingInvites: number;
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  userId: string;          // FK → User.id
  user?: User;             // eager-loaded optional
  role: TeamRole;          // 'admin' | 'member'
  joinedAt: string;
}
```

---

### Task

Stored in PostgreSQL `tasks` table.

```ts
interface Task {
  id: string;              // e.g. "TF-001" (project prefix + sequential number)
  title: string;
  priority: Priority;
  status: TaskStatus;
  label: LabelType;
  assigneeId: string;      // FK → User.id
  assignee?: User;         // eager-loaded optional
  teamId: string;          // FK → Team.id (required)
  team?: Team;             // eager-loaded optional
  dueDate: string;         // ISO 8601 date string "YYYY-MM-DD"
  description?: string;    // markdown body
  projectId?: string;      // FK → Project.id (optional)
  sprintId?: string;       // FK → Sprint.id (optional)
  createdAt: string;
  updatedAt: string;
}
```

---

### Project

Stored in PostgreSQL `projects` table.

```ts
interface Project {
  id: string;
  name: string;
  slug: string;            // e.g. "taskflow" → task IDs use "TF-" prefix
  ownerId: string;         // FK → User.id
  members: User[];
  createdAt: string;
  updatedAt: string;
}
```

---

### Sprint

Stored in PostgreSQL `sprints` table.

```ts
interface Sprint {
  id: string;
  name: string;            // e.g. "Sprint 1"
  projectId: string;       // FK → Project.id
  status: 'planning' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}
```

---

### Invitation

Stored in PostgreSQL `invitations` table.

```ts
interface Invitation {
  id: string;
  teamId: string;          // FK → Team.id (null for workspace-only invites)
  invitedBy: string;       // FK → User.id
  email: string;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## Board Types

Derived / computed types used only in the Board MFE.

```ts
interface BoardColumn {
  id: TaskStatus;
  title: string;           // 'To Do' | 'In Progress' | 'Review' | 'Done'
  color: string;
  tasks: Task[];
}

interface BoardData {
  columns: BoardColumn[];
}
```

---

## Dashboard Types

```ts
interface DashboardStats {
  totalTasks: number;
  inProgress: number;
  completed: number;
  boardItems: number;
  completionRate: number;  // computed: Math.round(completed / totalTasks * 100)
}
```

---

## Activity and Notification Types (MongoDB)

```ts
interface Comment {
  id: string;
  taskId: string;          // FK → Task.id
  authorId: string;        // FK → User.id
  author?: User;
  body: string;            // markdown
  createdAt: string;
  updatedAt: string;
}

interface ActivityLog {
  _id: string;
  entityType: 'task' | 'project' | 'sprint' | 'comment';
  entityId: string;
  actorId: string;         // FK → User.id
  action: string;          // e.g. "status_changed", "comment_added", "assignee_changed"
  diff: Record<string, { from: unknown; to: unknown }>;
  timestamp: string;
}

interface Notification {
  _id: string;
  recipientId: string;     // FK → User.id
  type: 'task_assigned' | 'comment_added' | 'due_soon' | 'status_changed';
  payload: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

interface UserPreferences {
  _id: string;             // = User.id
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  defaultTaskFilter: TaskStatus | 'all';
  notificationsEnabled: boolean;
}
```

---

## Mock Data (Current Phase 0)

### Workspace Teams (`shell/src/lib/workspace.ts`)

```ts
interface WorkspaceTeam {
  id: string;
  name: string;
  color: string;
}

const WORKSPACE_TEAMS: WorkspaceTeam[] = [
  { id: 'team_1', name: 'Taskflow Core',  color: '#6155DD' },
  { id: 'team_2', name: 'Design System',  color: '#32B173' },
  { id: 'team_3', name: 'API Gateway',    color: '#E09D34' },
];
```

### Workspace Members (`shell/src/lib/workspace.ts`)

```ts
const WORKSPACE_MEMBERS: WorkspaceMember[] = [
  { id: 'u1', initials: 'AC', name: 'Arkabrata C.', email: 'arkabrata@codeclouds.com', title: 'Engineer',        teamIds: ['team_1', 'team_2'], status: 'active' },
  { id: 'u2', initials: 'JD', name: 'John Doe',     email: 'john@codeclouds.com',      title: 'Product Manager', teamIds: ['team_1'],           status: 'active' },
  { id: 'u3', initials: 'MK', name: 'Maya Khan',    email: 'maya@codeclouds.com',      title: 'Designer',        teamIds: ['team_1'],           status: 'active' },
  { id: 'u4', initials: 'SR', name: 'Sam Roy',      email: 'sam@codeclouds.com',       title: 'Engineer',        teamIds: ['team_2'],           status: 'active' },
  { id: 'u5', initials: 'PR', name: 'Priya R.',     email: 'priya@external.com',       title: '—',               teamIds: [],                   status: 'pending' },
];
```

---

## Entity Relationship Summary

```
User (1) ──────── (M) WorkspaceMember
User (M) ──────── (M) Team           [via team_members]
User (M) ──────── (M) Project        [via project_members]
Team (1) ──────── (M) Task
Project (1) ───── (M) Task
Project (1) ───── (M) Sprint
Sprint (1) ─────── (M) Task
Task (1) ──────── (M) Comment
Task (M) ──────── (M) Label          [via task_labels]
User (1) ──────── (1) UserPreferences
User (1) ──────── (M) Notification
Task/Project (1) ─ (M) ActivityLog   [via entityId + entityType]
```
