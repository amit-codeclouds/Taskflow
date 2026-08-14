import apiClient from '@/lib/http/client';
import type { ExportTasksPayload } from '@/lib/types/export.types';

export const exportService = {
  // Response is a raw CSV/XLSX file, not the standard ApiResponse envelope.
  async exportTasks(payload: ExportTasksPayload): Promise<Blob> {
    const { data } = await apiClient.post<Blob>('/tasks/export', payload, {
      responseType: 'blob',
    });
    return data;
  },
};
