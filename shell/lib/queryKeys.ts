export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  people: {
    all: () => ['people'] as const,
    list: () => ['people', 'list'] as const,
    stats: () => ['people', 'stats'] as const,
  },
  teams: {
    all: () => ['teams'] as const,
    list: () => ['teams', 'list'] as const,
    stats: () => ['teams', 'stats'] as const,
    detail: (id: string) => ['teams', 'detail', id] as const,
  },
  users: {
    all: () => ['users'] as const,
    list: () => ['users', 'list'] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
} as const;
