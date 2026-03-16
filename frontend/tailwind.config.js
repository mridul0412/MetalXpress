/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0D0D0D',
        surface: '#141414',
        surface2: '#1E1E1E',
        surface3: '#252525',
        border: '#2A2A2A',
        'border-light': '#333333',
        gold: '#CFB53B',
        'gold-light': '#E8CC5A',
        'gold-dark': '#A89028',
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
      boxShadow: {
        gold: '0 0 20px rgba(207,181,59,0.15)',
        'gold-sm': '0 0 8px rgba(207,181,59,0.1)',
      },
    },
  },
  plugins: [],
};
