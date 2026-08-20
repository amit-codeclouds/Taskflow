import apiClient from '@/lib/http/client';
import type { WorkspaceDetails } from '@/lib/types/workspace.types';

export const workspaceService = {
  // GET /api/workspace/:workspaceId/info — workspace details (owner, teams, members).
  async info(workspaceId: string): Promise<WorkspaceDetails> {
    const { data } = await apiClient.get<{ result: WorkspaceDetails }>(`/workspace/${workspaceId}/info`);
    return data.result;
  },
};
