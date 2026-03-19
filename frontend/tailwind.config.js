/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#080E1A',
        surface: '#0D1420',
        surface2:'#111927',
        surface3:'#172030',
        gold:        '#CFB53B',
        'gold-light':'#E8CC5A',
        'gold-dark': '#A89028',
        up:   '#34d399',
        down: '#f87171',
      },
      fontFamily: {
        mono:    ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        display: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        gold:    '0 0 20px rgba(207,181,59,0.15)',
        'gold-sm':'0 0 8px rgba(207,181,59,0.10)',
        gold12:  '0 4px 12px rgba(207,181,59,0.20)',
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.07)',
      },
    },
  },
  plugins: [],
};
