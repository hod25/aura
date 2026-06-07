/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      colors: {
        // Refined slate base
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5dae1',
          300: '#b0b9c6',
          400: '#8593a5',
          500: '#65748a',
          600: '#505d72',
          700: '#424c5d',
          800: '#3a414f',
          900: '#0f1722',
          950: '#080d14',
        },
        // Emerald accent
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Gold highlight
        gold: {
          50: '#fbf8ef',
          100: '#f5edd2',
          200: '#ead9a3',
          300: '#dec06d',
          400: '#d4a843',
          500: '#c8932f',
          600: '#ad7426',
          700: '#8b5722',
          800: '#744622',
          900: '#633b20',
        },
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(8, 13, 20, 0.18)',
        'glow-emerald': '0 0 30px -8px rgba(16, 185, 129, 0.45)',
        'glow-gold': '0 0 30px -8px rgba(200, 147, 47, 0.4)',
        soft: '0 10px 40px -12px rgba(8, 13, 20, 0.25)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        'fade-up': 'fade-up 0.5s ease-out both',
        float: 'float 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
