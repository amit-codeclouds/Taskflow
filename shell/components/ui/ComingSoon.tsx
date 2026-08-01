interface ComingSoonProps {
  /** Override the default "Coming soon" text. */
  label?: string;
  /** Extra classes for spacing in context (e.g. "ml-2"). */
  className?: string;
}

/**
 * Small "Coming soon" pill used to mark features that are not live yet.
 * Mirrors the badge previously inlined in the Settings → Security card.
 */
export default function ComingSoon({ label = 'Coming soon', className = '' }: ComingSoonProps) {
  return (
    <span
      className={`inline-flex items-center text-2xs font-medium text-text-300 bg-bg-800 px-1.5 py-px rounded-full ${className}`}
    >
      {label}
    </span>
  );
}
