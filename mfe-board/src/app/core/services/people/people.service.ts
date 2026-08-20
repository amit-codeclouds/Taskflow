import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiService } from '../../api.service';
import { Person } from '../../../shared/interfaces/board.interface';

// Backend wraps successful payloads as { result: T }. /api/people is paginated.
interface ApiResult<T> {
  result: T;
}
interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class PeopleService {
  private api = inject(ApiService);

  // GET /api/people — workspace members (active + pending). Fetch a large page so
  // the assignee filter shows the full list. Tolerates either a paginated
  // ({ result: { data } }) or a plain-array ({ result: [] }) envelope.
  getPeople(): Observable<Person[]> {
    return this.api
      .get<ApiResult<Paginated<Person> | Person[]>>('/api/people', { params: { limit: 100 } })
      .pipe(
        map((res) => {
          const r = res?.result as Paginated<Person> | Person[] | undefined;
          return Array.isArray(r) ? r : r?.data ?? [];
        }),
      );
  }
}
