'use client';

import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { exportService } from '@/lib/services/export.service';
import { extractErrorMessage } from '@/lib/http/extractError';
import type { ExportTasksPayload } from '@/lib/types/export.types';

const EXTENSIONS: Record<ExportTasksPayload['format'], string> = {
  Csv: 'csv',
  Xlsx: 'xlsx',
};

function triggerDownload(blob: Blob, payload: ExportTasksPayload) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${payload.fileName}.${EXTENSIONS[payload.format]}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function useExportTasks() {
  return useMutation({
    mutationFn: (payload: ExportTasksPayload) => exportService.exportTasks(payload),
    onSuccess: (blob, payload) => {
      triggerDownload(blob, payload);
      toast.success('Export downloaded!');
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'Export failed')),
  });
}
