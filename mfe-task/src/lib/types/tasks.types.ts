// Matches Priority enum from backend
export type Priority = 'High' | 'Medium' | 'Low';

// Matches LabelType enum from backend
export type LabelType = 'Feature' | 'Bug' | 'Design' | 'Docs' | 'Infra' | 'Refactor';

// Matches AssigneeSummaryDto
export interface AssigneeSummary {
  userId: string;
  name?: string;
  avatarInitials?: string;
  avatarUrl?: string;
}

// Matches TaskResponseDto
export interface ApiTask {
  id: string;
  taskNumber: number;
  title: string;
  description?: string;
  priority: Priority;
  label?: LabelType;
  statusId: string;
  teamId: string;
  assignees: AssigneeSummary[];
  expectedCompletion?: string;
  progress: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaskListParams {
  search?: string;
  teamId?: string;
  page?: number;
  limit?: number;
}

// Matches CreateTaskRequestDto
export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority: Priority;
  label?: LabelType;
  statusId: string;
  teamId: string;
  assigneeIds?: string[];
  expectedCompletion?: string | null;
  progress?: number;
}

// Matches UpdateTaskRequestDto
export type UpdateTaskPayload = Partial<CreateTaskPayload>;

// Matches StatusChangeRequestDto
export interface ChangeTaskStatusPayload {
  statusId: string;
}
