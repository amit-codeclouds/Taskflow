import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiService } from '../../api.service';
import { ApiBoardTask, TeamBoard } from '../../../shared/interfaces/board.interface';

// Backend wraps successful payloads as { result: T } (see AuthService).
interface ApiResult<T> {
  result: T;
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

  // PATCH /api/tasks/:taskId/status — move a task to another status (drag-drop).
  // Body: { statusId }. ApiService attaches the access token from the
  // taskflow_access_token cookie as an Authorization: Bearer header.
  updateTaskStatus(taskId: string, statusId: string): Observable<ApiBoardTask> {
    return this.api
      .patch<ApiResult<ApiBoardTask>>(`/api/tasks/${taskId}/status`, { statusId })
      .pipe(map((res) => res.result));
  }
}
