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
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'base': ['12px', { lineHeight: 'normal', fontWeight: '400' }],
        'xs': ['11px', { lineHeight: 'normal', fontWeight: '400' }],
        'sm': ['12px', { lineHeight: 'normal', fontWeight: '400' }],
        'lg': ['14px', { lineHeight: 'normal', fontWeight: '400' }],
        'xl': ['16px', { lineHeight: 'normal', fontWeight: '500' }],
        '2xl': ['20px', { lineHeight: 'normal', fontWeight: '600' }],
        '3xl': ['24px', { lineHeight: 'normal', fontWeight: '600' }],
        '4xl': ['28px', { lineHeight: 'normal', fontWeight: '700' }],
        '5xl': ['32px', { lineHeight: 'normal', fontWeight: '700' }],
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      }
    },
  },
  plugins: [],
}
