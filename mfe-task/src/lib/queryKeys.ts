export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  tasks: {
    all: () => ['tasks'] as const,
    myList: (params?: { search?: string; teamId?: string; page?: number; limit?: number }) =>
      ['tasks', 'my', params] as const,
    detail: (id: string) => ['tasks', 'detail', id] as const,
  },
  teams: {
    all: () => ['teams'] as const,
    list: () => ['teams', 'list'] as const,
  },
  people: {
    all: () => ['people'] as const,
    list: (params?: { search?: string; teamId?: string; limit?: number }) => ['people', 'list', params] as const,
  },
  boardStatuses: {
    byTeam: (teamId: string) => ['board-statuses', teamId] as const,
  },
  comments: {
    all: () => ['comments'] as const,
    list: (taskId: string) => ['comments', 'list', taskId] as const,
  },
} as const;
