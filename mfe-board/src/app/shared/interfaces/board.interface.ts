export interface Assignee {
  initials: string;
  avatarUrl?: string;
}

export interface Task {
  id: string;         // display id, e.g. "#42"
  taskId: string;     // real backend UUID — used for API calls (status update)
  title: string;
  priority: 'high' | 'medium' | 'low';
  label: string;
  labelColor: string;
  assignees: Assignee[];
  due: string;
}

export interface Column {
  id: string;
  statusId: string;
  title: string;
  description: string;
  color: string;
  count: number;
  isArchievable: boolean;
  isDeletable: boolean;
  tasks: Task[];
}

// Matches TeamMemberSummaryDto from the backend (see shell/lib/types/teams.types.ts).
export interface TeamMember {
  userId: string;
  name: string;
  avatarInitials?: string;
  avatarUrl?: string;
  role: string;
}

// ── GET /api/tasks/team/:teamId/board → { result: { columns: [...] } } ──────
// Field names beyond the confirmed `columns[].tasks[]` path are tolerant (a few
// aliases) since the exact inner shape is still being verified against the live
// payload. Tighten these once the response is confirmed.
export interface ApiBoardTask {
  id: string;
  taskNumber?: number;
  number?: number;
  title: string;
  priority?: string;
  label?: string;
  statusId?: string;
  assignees?: TeamMember[];
  expectedCompletion?: string;
  dueDate?: string;
  due?: string;
  progress?: number;
}

export interface ApiBoardColumn {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  color?: string;
  position?: number;
  totalTasks?: number;
  count?: number;
  isArchievable?: boolean;
  isDeletable?: boolean;
  tasks: ApiBoardTask[];
}

export interface TeamBoard {
  columns: ApiBoardColumn[];
}
// ───────────────────────────────────────────────────────────────────────────

// ── GET /api/migrate/task/archived?teamId=&page=&limit=&statusId=&search= ──
// One assignee on an archived task. Note: `id` (not `userId`) and the fields may
// be empty strings ("") rather than absent — the mapper handles that.
export interface ArchivedAssignee {
  id: string;
  name: string;
  avatarInitials?: string;
  avatarUrl?: string;
}

// One archived task as returned by the archived-tasks list. Confirmed against the
// live payload: assignees arrive under `assigneeDetails`, priority is capitalised
// (e.g. "High"), and `label`/`avatarUrl` may be null/"".
export interface ApiArchivedTask {
  id: string;
  taskNumber?: number;
  number?: number;
  title: string;
  description?: string | null;
  priority?: string | null;
  label?: string | null;
  statusId?: string;
  teamId?: string;
  assigneeDetails?: ArchivedAssignee[];
  assignees?: ArchivedAssignee[];   // alias tolerance
  expectedCompletion?: string | null;
  progress?: number;
  // Present on the single-task detail response (GET .../archived/:taskId).
  createdBy?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
}

// Generic paginated envelope used by list endpoints ({ data, total, page, ... }).
export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
// ───────────────────────────────────────────────────────────────────────────

// Body for creating a board status (POST). Field names mirror the modal form.
export interface CreateStatusPayload {
  name: string;
  description: string;
  // position: number;   // dropped from the form — the server assigns the column order
  teamId: string;
  isArchievable: boolean;
}

// One per-status task count as returned inside a team's `statusTaskCounts`.
// Field names are tolerant since the exact shape is still being confirmed.
export interface StatusTaskCountItem {
  statusName?: string;
  status?: string;
  name?: string;
  count?: number;
  taskCount?: number;
}

// Matches TeamResponseDto returned by GET /api/teams. The extra fields beyond
// id/name/color are optional so lightweight team references still satisfy the type.
export interface Team {
  id: string;
  name: string;
  color: string;
  description?: string;
  workspaceId?: string;
  adminId?: string;
  pendingInvites?: number;
  members?: TeamMember[];
  // Per-status task counts (Todo / In Progress / Done, plus any custom statuses).
  // May arrive as an array of items or an object map { "In Progress": 3, ... }.
  statusTaskCounts?: StatusTaskCountItem[] | Record<string, number>;
  createdAt?: string;
  updatedAt?: string;
}
