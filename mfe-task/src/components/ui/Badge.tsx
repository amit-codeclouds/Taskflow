interface BadgeProps {
  label: string;
  variant: 'active' | 'next' | 'planned' | 'high' | 'medium' | 'low' | 'in-progress' | 'review' | 'todo' | 'done';
}

const variantStyles: Record<BadgeProps['variant'], string> = {
  active:      'bg-green-bg text-status-green',
  next:        'bg-bg-600 text-text-300',
  planned:     'bg-bg-600 text-text-300',
  high:        'bg-red-bg text-status-red',
  medium:      'bg-amber-bg text-status-amber',
  low:         'bg-bg-600 text-text-300',
  'in-progress': 'bg-accent-bg text-accent-hover',
  review:      'bg-amber-bg text-status-amber',
  todo:        'bg-bg-600 text-text-300',
  done:        'bg-green-bg text-status-green',
};

export default function Badge({ label, variant }: BadgeProps) {
  return (
    <span className={`text-2xs font-medium px-2 py-0.5 rounded-full ${variantStyles[variant]}`}>
      {label}
    </span>
  );
}
