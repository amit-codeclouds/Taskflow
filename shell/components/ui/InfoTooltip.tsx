'use client';

import { Info } from 'lucide-react';

interface InfoTooltipProps {
  text: string;
  className?: string;
}

/** Small info icon with a hover/focus tooltip. Keyboard-accessible via focus-within. */
export default function InfoTooltip({ text, className = '' }: InfoTooltipProps) {
  return (
    <span className={`relative inline-flex group/tooltip ${className}`}>
      <button
        type="button"
        aria-label={text}
        className="flex items-center justify-center text-text-300 hover:text-text-100 focus:outline-none focus-visible:text-text-100 transition-colors"
      >
        <Info size={13} strokeWidth={1.5} />
      </button>
      <span
        role="tooltip"
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 text-left
          pointer-events-none opacity-0 scale-95
          group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100
          group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:scale-100
          transition-all duration-150"
      >
        <span className="block bg-bg-600 border border-border-subtle rounded-lg px-3 py-2 shadow-elevated text-2xs leading-relaxed text-text-200">
          {text}
        </span>
      </span>
    </span>
  );
}
