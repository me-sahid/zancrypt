/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          bg: '#0B1120',
          accent: '#3B82F6',
        },
        surface: {
          secondary: '#111827',
          elevated: '#1E293B',
        },
        security: '#06B6D4',
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.06)'
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
