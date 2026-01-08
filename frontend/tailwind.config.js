/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        emotion: {
          calm: '#4A90E2',
          joy: '#F5A623',
          sadness: '#7B68EE',
          anger: '#E74C3C',
          fear: '#9B59B6',
          love: '#E91E63',
          peace: '#2ECC71',
        },
        background: {
          DEFAULT: '#0A0A0F',
          dark: '#0A0A0F',
          darker: '#050508',
          light: '#1A1A2E',
        },
        accent: {
          DEFAULT: '#6C63FF',
          primary: '#6C63FF',
          secondary: '#FF6584',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.1)',
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(108, 99, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(108, 99, 255, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
