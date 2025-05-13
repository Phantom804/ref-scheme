/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          950: '#0A0A0F',
          900: '#121218',
          800: '#1F1F28',
        },
        purple: {
          600: '#7e22ce',
        },
        blue: {
          600: '#2563eb',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};