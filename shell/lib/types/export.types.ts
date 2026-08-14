// Matches ExportFormat enum + ExportTasksRequestDto on the backend
export type ExportFormat = 'Csv' | 'Xlsx';

export interface ExportTasksPayload {
  teamId: string;
  fileName: string;
  isIncludeArchiveTask: boolean;
  format: ExportFormat;
}
