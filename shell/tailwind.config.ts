import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-900': '#121215',
        'bg-800': '#1A1A1E',
        'bg-700': '#222227',
        'bg-600': '#2C2C32',
        'bg-500': '#393940',
        'text-100': '#F4F3F0',
        'text-200': '#ABAAA5',
        'text-300': '#6E6C6A',
        'accent':       '#6155DD',
        'accent-hover': '#766BE8',
        'accent-bg':    '#261F42',
        'status-green': '#32B173',
        'status-amber': '#E09D34',
        'status-red':   '#DC4949',
        'green-bg':     '#123822',
        'amber-bg':     '#45320D',
        'red-bg':       '#451515',
        'border-subtle':'#2C2C32',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '16px', letterSpacing: '0.04em' }],
      },
      boxShadow: {
        'card':     '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'elevated': '0 4px 16px rgba(0,0,0,0.5)',
        'glow':     '0 0 20px rgba(97, 85, 221, 0.15)',
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
