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
        // Brand
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6C63FF',
          600: '#5b54e6',
          700: '#4a44b8',
          800: '#3a358a',
          900: '#2a275c',
        },
        accent: {
          cyan:  '#00D4FF',
          coral: '#FF6B6B',
          green: '#22C55E',
          red:   '#EF4444',
          amber: '#F59E0B',
        },
        // Surfaces
        surface: {
          bg:     '#0A0A1A',
          card:   'rgba(20, 20, 43, 0.6)',
          border: 'rgba(255, 255, 255, 0.08)',
          hover:  'rgba(255, 255, 255, 0.04)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 24px rgba(108, 99, 255, 0.35)',
        'glow-cyan':    '0 0 24px rgba(0, 212, 255, 0.35)',
        'glow-green':   '0 0 20px rgba(34, 197, 94, 0.35)',
        'glow-red':     '0 0 20px rgba(239, 68, 68, 0.35)',
        'soft':         '0 4px 24px rgba(0, 0, 0, 0.35)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6C63FF 0%, #00D4FF 100%)',
        'gradient-coral':   'linear-gradient(135deg, #FF6B6B 0%, #FFB199 100%)',
        'gradient-dark':    'radial-gradient(circle at 20% 0%, #1a1a3e 0%, #0A0A1A 60%)',
      },
      animation: {
        'fade-in':   'fadeIn 0.4s ease-out',
        'slide-up':  'slideUp 0.4s ease-out',
        'slide-in':  'slideIn 0.3s ease-out',
        'pulse-glow':'pulseGlow 2s ease-in-out infinite',
        'shimmer':   'shimmer 1.8s linear infinite',
      },
      keyframes: {
        fadeIn:   { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp:  { '0%': { opacity: 0, transform: 'translateY(12px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' } },
        slideIn:  { '0%': { opacity: 0, transform: 'translateX(-8px)' },
                    '100%': { opacity: 1, transform: 'translateX(0)' } },
        pulseGlow:{ '0%,100%': { boxShadow: '0 0 20px rgba(108,99,255,0.4)' },
                    '50%':     { boxShadow: '0 0 32px rgba(108,99,255,0.7)' } },
        shimmer:  { '0%': { backgroundPosition: '-500px 0' },
                    '100%': { backgroundPosition: '500px 0' } },
      },
    },
  },
  plugins: [],
};