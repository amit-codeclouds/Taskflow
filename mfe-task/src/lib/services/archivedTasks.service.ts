import apiClient from '@/lib/http/client';
import type { ApiArchivedTask, ArchivedTasksParams } from '@/lib/types/archivedTasks.types';
import type { PagedResult } from '@/lib/types/tasks.types';

// Response envelope for this endpoint isn't fully pinned down yet (see
// mfe-board's TeamService.getArchivedTasks, which unwraps the same tolerantly) —
// normalize whichever of { result: { data } } | { data } | { result: [] } | [] comes back.
function normalizePage<T>(res: unknown, page: number, limit: number): PagedResult<T> {
  const body = (res && typeof res === 'object' && 'result' in (res as object))
    ? (res as { result: unknown }).result
    : res;

  const data: T[] = Array.isArray(body)
    ? (body as T[])
    : ((body as { data?: T[] })?.data ?? []);

  const meta = (body && typeof body === 'object' ? body : {}) as Partial<PagedResult<T>>;
  const total = meta.total ?? data.length;
  return {
    data,
    total,
    page: meta.page ?? page,
    limit: meta.limit ?? limit,
    totalPages: meta.totalPages ?? Math.max(1, Math.ceil(total / (meta.limit ?? limit))),
  };
}

export const archivedTasksService = {
  async list(params: ArchivedTasksParams): Promise<PagedResult<ApiArchivedTask>> {
    const { teamId, page = 1, limit = 10, statusId, search } = params;
    const { data } = await apiClient.get<unknown>('/migrate/task/archived', {
      params: { teamId, page, limit, statusId, search },
    });
    return normalizePage<ApiArchivedTask>(data, page, limit);
  },

  async getById(taskId: string): Promise<ApiArchivedTask> {
    const { data } = await apiClient.get<unknown>(`/migrate/task/archived/${taskId}`);
    return (data && typeof data === 'object' && 'result' in (data as object))
      ? (data as { result: ApiArchivedTask }).result
      : (data as ApiArchivedTask);
  },
};
