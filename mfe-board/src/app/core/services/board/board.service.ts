import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiService } from '../../api.service';
import { Team } from '../../../shared/interfaces/board.interface';

// Backend wraps successful payloads as { result: T } (see AuthService).
interface ApiResult<T> {
  result: T;
}

@Injectable({ providedIn: 'root' })
export class BoardService {
  private api = inject(ApiService);

  // GET /api/teams — called as a same-origin relative path so it is proxied to the
  // backend (Angular dev proxy in `ng serve`, or the Cloudflare Worker in prod),
  // avoiding cross-origin CORS. ApiService attaches the access token from the
  // taskflow_access_token cookie as an Authorization: Bearer header.
  //
  // Pass excludeWorkspace to fetch "Assigned Teams" (teams the user is a member of
  // outside their own workspace) instead of the default "Workspace Teams" list —
  // mirrors the shell's teamsService.list({ excludeWorkspace }) convention.
  getTeams(params?: { excludeWorkspace?: boolean }): Observable<Team[]> {
    return this.api
      .get<ApiResult<Team[]>>('/api/teams', {
        params: params?.excludeWorkspace ? { exclude_workspace: true } : undefined,
      })
      .pipe(map((res) => res.result));
  }
}
