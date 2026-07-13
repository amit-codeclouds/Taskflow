export interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  label: string;
  labelColor: string;
  assignee: string;
  due: string;
}

export interface Column {
  id: string;
  statusId: string;
  title: string;
  color: string;
  count: number;
  tasks: Task[];
}

// Matches TeamMemberSummaryDto from the backend (see shell/lib/types/teams.types.ts).
export interface TeamMember {
  userId: string;
  name: string;
  avatarInitials?: string;
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
  color?: string;
  position?: number;
  totalTasks?: number;
  count?: number;
  tasks: ApiBoardTask[];
}

export interface TeamBoard {
  columns: ApiBoardColumn[];
}
// ───────────────────────────────────────────────────────────────────────────

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
