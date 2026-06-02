import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1A3A6B',
        orange: '#D97218',
        steel: '#2B6CB0',
        skySurface: '#EBF4FA',
        charcoal: '#333333',
        midGray: '#666666',
        line: '#E0E6EE',
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 18px 55px rgba(26, 58, 107, 0.16)',
        orange: '0 16px 40px rgba(217, 114, 24, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
