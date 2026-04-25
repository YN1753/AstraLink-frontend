/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'deep-space': {
          DEFAULT: '#0B0E14',
          '50': '#1A1F2E',
          '100': '#141925',
          '200': '#0B0E14',
          '300': '#080A10',
        },
        'neon': {
          'cyan': '#00E5FF',
          'blue': '#0077FF',
          'purple': '#B026FF',
        }
      },
      backdropBlur: {
        'xs': '2px',
        'xl': '12px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'orbit-spin': 'orbit-spin 20s linear infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-out': 'fade-out 0.3s ease-in',
        'pulse-halo': 'pulse-halo 3s ease-in-out infinite',
        'spin-trail': 'spin-trail 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'dash-flow': 'dash-flow 1s linear infinite',
        'glow-pulse': 'glow-pulse 1.5s ease-in-out infinite',
        'orbit-drift': 'orbit-drift 20s linear infinite',
        'node-pulse': 'node-pulse 1.2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 1 },
        },
        'orbit-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'fade-out': {
          '0%': { opacity: 1, transform: 'translateY(0)' },
          '100%': { opacity: 0, transform: 'translateY(10px)' },
        },
        'pulse-halo': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.2)' },
        },
        'spin-trail': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-5px) scale(1.05)' },
        },
        'dash-flow': {
          'to': { 'stroke-dashoffset': '-10' },
        },
        'glow-pulse': {
          '0%, 100%': {
            'box-shadow': '0 0 5px rgba(0,229,255,0.3), inset 0 0 5px rgba(0,229,255,0.1)'
          },
          '50%': {
            'box-shadow': '0 0 15px rgba(0,229,255,0.5), inset 0 0 10px rgba(0,229,255,0.2)'
          },
        },
        'orbit-drift': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'node-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
        },
      }
    },
  },
  plugins: [],
}