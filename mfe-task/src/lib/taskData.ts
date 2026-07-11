import type { Priority, LabelType } from '@/lib/types/tasks.types';

export const LABEL_STYLES: Record<LabelType, string> = {
  Feature:  'bg-accent-bg text-accent-hover',
  Bug:      'bg-red-bg text-status-red',
  Design:   'bg-[#1a2038] text-[#6a9eef]',
  Docs:     'bg-bg-600 text-text-300',
  Infra:    'bg-[#1a2a20] text-status-green',
  Refactor: 'bg-amber-bg text-status-amber',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  High:   'bg-status-red',
  Medium: 'bg-status-amber',
  Low:    'bg-status-green',
};

export const PRIORITY_TEXT: Record<Priority, string> = {
  High:   'text-status-red',
  Medium: 'text-status-amber',
  Low:    'text-status-green',
};
