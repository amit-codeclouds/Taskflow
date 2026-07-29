import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-900': 'var(--color-bg-900)',
        'bg-800': 'var(--color-bg-800)',
        'bg-700': 'var(--color-bg-700)',
        'bg-600': 'var(--color-bg-600)',
        'bg-500': 'var(--color-bg-500)',
        'text-100': 'var(--color-text-100)',
        'text-200': 'var(--color-text-200)',
        'text-300': 'var(--color-text-300)',
        'accent':       'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-bg':    'var(--color-accent-bg)',
        'status-green': 'var(--color-status-green)',
        'status-amber': 'var(--color-status-amber)',
        'status-red':   'var(--color-status-red)',
        'green-bg':     'var(--color-green-bg)',
        'amber-bg':     'var(--color-amber-bg)',
        'red-bg':       'var(--color-red-bg)',
        'border-subtle':'var(--color-border-subtle)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '16px', letterSpacing: '0.04em' }],
      },
      boxShadow: {
        'card':     'var(--shadow-card)',
        'elevated': 'var(--shadow-elevated)',
        'glow':     'var(--shadow-glow)',
      },
      borderRadius: {
        'card': '10px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
