// Well-known status names get a fixed, meaningful color (e.g. Done -> green).
// Custom/team-defined statuses fall back to a deterministic pick from the
// palette below, keyed by name so the same status always renders the same
// color for a given team.
const STATUS_COLOR_MAP: Record<string, string> = {
  backlog: 'var(--color-text-300)',
  todo: 'var(--color-text-300)',
  inprogress: 'var(--color-accent)',
  inreview: 'var(--color-status-amber)',
  review: 'var(--color-status-amber)',
  done: 'var(--color-status-green)',
  completed: 'var(--color-status-green)',
  blocked: 'var(--color-status-red)',
  cancelled: 'var(--color-status-red)',
};

const STATUS_COLOR_PALETTE = [
  'var(--color-accent)',
  'var(--color-status-green)',
  'var(--color-status-amber)',
  'var(--color-status-red)',
  '#6a9eef',
  '#9B59B6',
  '#1ABC9C',
  '#E67E22',
  '#E09D34',
  'var(--color-text-300)',
];

function normalizeStatusKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z]/g, '');
}

export function colorForStatus(name: string): string {
  const key = normalizeStatusKey(name);
  if (STATUS_COLOR_MAP[key]) return STATUS_COLOR_MAP[key];

  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return STATUS_COLOR_PALETTE[hash % STATUS_COLOR_PALETTE.length];
}
