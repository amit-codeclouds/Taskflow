export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
    stats: () => ['auth', 'me', 'stats'] as const,
  },
  people: {
    all: () => ['people'] as const,
    list: (params?: { search?: string; teamId?: string; page?: number }) =>
      ['people', 'list', params] as const,
    stats: () => ['people', 'stats'] as const,
  },
  teams: {
    all: () => ['teams'] as const,
    list: (params?: { excludeWorkspace?: boolean }) =>
      params ? (['teams', 'list', params] as const) : (['teams', 'list'] as const),
    stats: () => ['teams', 'stats'] as const,
    detail: (id: string) => ['teams', 'detail', id] as const,
  },
  users: {
    all: () => ['users'] as const,
    list: (params?: { workspaceId?: string }) => ['users', 'list', params] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
  settings: {
    mine: () => ['settings', 'me'] as const,
  },
  invitations: {
    byUser: (userId: string) => ['invitations', 'user', userId] as const,
  },
} as const;
