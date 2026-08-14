import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../api.service';
import { ExportTasksPayload } from '../../../shared/interfaces/export.interface';

@Injectable({ providedIn: 'root' })
export class ExportService {
  private api = inject(ApiService);

  // POST /api/tasks/export — response is a raw CSV/XLSX file, not the { result } envelope.
  exportTasks(payload: ExportTasksPayload): Observable<Blob> {
    return this.api.postBlob('/api/tasks/export', payload);
  }
}
