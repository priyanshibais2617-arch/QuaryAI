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
        dark: {
          bg: '#080B10',
          secondary: '#0E131A',
          card: '#111820',
          elevated: '#151C25',
          text: '#F5F7FA',
          subtext: '#A7B0BA',
          border: 'rgba(255, 255, 255, 0.08)',
          accent: '#4FD1C5',
          accent2: '#7C83FD',
          success: '#39D98A',
          warning: '#F5B942',
          error: '#FF6B6B',
        },
        light: {
          bg: '#F6F8FA',
          secondary: '#EEF2F5',
          card: '#FFFFFF',
          elevated: '#F9FAFB',
          text: '#111827',
          subtext: '#5B6472',
          border: 'rgba(15, 23, 42, 0.10)',
          accent: '#179E95',
          accent2: '#626AE8',
          success: '#1D9D61',
          warning: '#C98900',
          error: '#D64545',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radar 4s linear infinite',
        'orbit': 'orbit 20s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
