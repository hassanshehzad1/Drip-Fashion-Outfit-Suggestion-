/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#E91E63',
          light: '#F48FB1',
          dark: '#C2185B',
          50: '#FCE4EC',
          100: '#F8BBD0',
          200: '#F48FB1',
        },
        dark: { DEFAULT: '#0F0F0F', surface: '#1A1A1A', card: '#222222' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.36,0.07,0.19,0.97)',
        'pulse-brand': 'pulseBrand 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        bounceIn: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.15)' } },
        pulseBrand: { '0%,100%': { boxShadow: '0 0 0 0 rgba(233,30,99,0.4)' }, '70%': { boxShadow: '0 0 0 10px rgba(233,30,99,0)' } },
        float: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
      },
    },
  },
  plugins: [],
}
