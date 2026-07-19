import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiService } from '../../api.service';
import {
  ApiArchivedTask,
  ApiBoardTask,
  CreateStatusPayload,
  Paginated,
  TeamBoard,
} from '../../../shared/interfaces/board.interface';

// Backend wraps successful payloads as { result: T } (see AuthService).
interface ApiResult<T> {
  result: T;
}

// Query params for the archived-tasks list.
export interface ArchivedTasksQuery {
  page?: number;
  limit?: number;
  statusId?: string;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class TeamService {
  private api = inject(ApiService);

  // GET /api/tasks/team/:teamId/board — the team's board (statuses + tasks).
  // Called as a same-origin relative path (proxied to the backend), and ApiService
  // attaches the access token from the taskflow_access_token cookie as a
  // Authorization: Bearer header. `teamId` comes from the route URL.
  getTeamBoard(teamId: string): Observable<TeamBoard> {
    return this.api
      .get<ApiResult<TeamBoard>>(`/api/tasks/team/${teamId}/board`)
      .pipe(map((res) => res.result));
  }

  // GET /api/migrate/task/archived?teamId=&page=&limit=&statusId=&search=
  // Archived tasks for a team. Returns a normalized Paginated<ApiArchivedTask>,
  // tolerating whichever envelope the backend uses:
  //   { result: { data: [...] } } | { data: [...] } | { result: [...] } | [...]
  getArchivedTasks(teamId: string, query: ArchivedTasksQuery = {}): Observable<Paginated<ApiArchivedTask>> {
    const { page = 1, limit = 10, statusId = '', search = '' } = query;
    return this.api
      .get<unknown>('/api/migrate/task/archived', {
        params: { teamId, page, limit, statusId, search },
      })
      .pipe(map((res) => this.normalizePage<ApiArchivedTask>(res, page, limit)));
  }

  // GET /api/migrate/task/archived/:taskId — a single archived task's detail.
  // Unwraps the { result: T } envelope if present.
  getArchivedTask(taskId: string): Observable<ApiArchivedTask> {
    return this.api
      .get<unknown>(`/api/migrate/task/archived/${taskId}`)
      .pipe(map((res) => this.unwrap<ApiArchivedTask>(res)));
  }

  // Unwrap a possibly-{ result: T }-wrapped single-object response.
  private unwrap<T>(res: unknown): T {
    return (res && typeof res === 'object' && 'result' in res)
      ? (res as { result: T }).result
      : (res as T);
  }

  // Unwrap a possibly-wrapped, possibly-array list response into a Paginated<T>.
  private normalizePage<T>(res: unknown, page: number, limit: number): Paginated<T> {
    const body = (res && typeof res === 'object' && 'result' in res)
      ? (res as { result: unknown }).result
      : res;

    const data: T[] = Array.isArray(body)
      ? (body as T[])
      : ((body as { data?: T[]; items?: T[]; tasks?: T[] })?.data
        ?? (body as { items?: T[] })?.items
        ?? (body as { tasks?: T[] })?.tasks
        ?? []);

    const meta = (body && typeof body === 'object' ? body : {}) as Partial<Paginated<T>>;
    const total = meta.total ?? data.length;
    return {
      data,
      total,
      page: meta.page ?? page,
      limit: meta.limit ?? limit,
      totalPages: meta.totalPages ?? Math.max(1, Math.ceil(total / (meta.limit ?? limit))),
    };
  }

  // PATCH /api/tasks/:taskId/status — move a task to another status (drag-drop).
  // Body: { statusId }. ApiService attaches the access token from the
  // taskflow_access_token cookie as an Authorization: Bearer header.
  updateTaskStatus(taskId: string, statusId: string): Observable<ApiBoardTask> {
    return this.api
      .patch<ApiResult<ApiBoardTask>>(`/api/tasks/${taskId}/status`, { statusId })
      .pipe(map((res) => res.result));
  }

  // POST /api/board-statuses/create — create a new board status.
  // Body: { name, description, position, teamId, isArchievable }.
  createStatus(payload: CreateStatusPayload): Observable<unknown> {
    return this.api
      .post<ApiResult<unknown>>('/api/board-statuses/create', payload)
      .pipe(map((res) => res.result));
  }

  // DELETE /api/board-statuses/:statusId — delete a board status.
  deleteStatus(statusId: string): Observable<unknown> {
    return this.api
      .delete<ApiResult<unknown>>(`/api/board-statuses/${statusId}`)
      .pipe(map((res) => res.result));
  }
}
