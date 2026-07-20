// Matches GET /api/migrate/task/archived?teamId=&page=&limit=&statusId=&search=
// Assignees arrive under `assigneeDetails` (id, not userId) — distinct from the
// live-task `assignees: AssigneeSummary[]` shape.
export interface ArchivedAssignee {
  id: string;
  name: string;
  avatarInitials?: string;
  avatarUrl?: string;
}

export interface ApiArchivedTask {
  id: string;
  taskNumber: number;
  title: string;
  description?: string | null;
  priority?: string | null;
  label?: string | null;
  statusId?: string;
  teamId?: string;
  assigneeDetails?: ArchivedAssignee[];
  expectedCompletion?: string | null;
  progress?: number;
  createdBy?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
}

export interface ArchivedTasksParams {
  teamId: string;
  page?: number;
  limit?: number;
  statusId?: string;
  search?: string;
}
