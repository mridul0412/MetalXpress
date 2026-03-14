/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0D0D0D',
        surface: '#1A1A1A',
        surface2: '#222222',
        border: '#2A2A2A',
        copper: '#B87333',
        brass: '#CFB53B',
        aluminium: '#A8C0C0',
        lead: '#708090',
        zinc: '#4A90D9',
        steel: '#888888',
        other: '#F5A623',
        up: '#22C55E',
        down: '#EF4444',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};
