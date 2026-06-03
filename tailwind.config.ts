import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1A3A6B',
        darkNavy: '#0F2443',
        orange: '#D97218',
        steel: '#2B6CB0',
        skySurface: '#EBF4FA',
        surface: '#F4F7FB',
        charcoal: '#333333',
        midGray: '#666666',
        line: '#E0E6EE',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at 18% 20%, rgba(43,108,176,0.55), transparent 32%), radial-gradient(circle at 80% 12%, rgba(217,114,24,0.23), transparent 30%), linear-gradient(135deg,#1A3A6B 0%,#17315B 54%,#0F2443 100%)',
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 18px 55px rgba(26, 58, 107, 0.16)',
        orange: '0 16px 40px rgba(217, 114, 24, 0.25)',
        soft: '0 18px 45px rgba(15, 36, 67, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
