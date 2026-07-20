import type { ApiTask } from './tasks.types';

// Matches GET /api/tasks/team/:teamId/board — { result: { teamId, columns: [...] } }.
// Column `id` doubles as the status id shared with each embedded task's `statusId`.
// Embedded tasks are full TaskResponseDto objects — identical shape to ApiTask.
export interface BoardColumn {
  id: string;
  name: string;
  description?: string | null;
  position: number;
  totalTasks: number;
  isArchievable: boolean;
  isDeletable: boolean;
  tasks: ApiTask[];
}

export interface TeamBoard {
  teamId: string;
  columns: BoardColumn[];
}
