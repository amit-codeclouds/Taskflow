interface BadgeProps {
  label: string;
  variant: 'active' | 'next' | 'planned';
}

const variantStyles: Record<BadgeProps['variant'], string> = {
  active:  'bg-green-bg text-status-green',
  next:    'bg-bg-600 text-text-300',
  planned: 'bg-bg-600 text-text-300',
};

export default function Badge({ label, variant }: BadgeProps) {
  return (
    <span className={`text-2xs font-medium px-2 py-0.5 rounded-full ${variantStyles[variant]}`}>
      {label}
    </span>
  );
}
