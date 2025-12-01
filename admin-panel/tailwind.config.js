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
        // Backgrounds - Light mode (default)
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          'chat-user': 'var(--bg-chat-user)',
          'chat-bot': 'var(--bg-chat-bot)',
        },
        // Text
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          inverse: 'var(--text-inverse)',
        },
        // Accent (warm terracotta)
        accent: {
          DEFAULT: '#D97757',
          hover: '#C4613D',
          soft: '#FEF2EE',
          glow: 'rgba(217, 119, 87, 0.15)',
        },
        // Feedback
        success: {
          DEFAULT: '#4A9D7C',
          soft: '#EDF7F3',
        },
        warning: {
          DEFAULT: '#D4A054',
          soft: '#FEF9EE',
        },
        error: {
          DEFAULT: '#C75D5D',
          soft: '#FDF2F2',
        },
        // Borders
        border: {
          subtle: 'var(--border-subtle)',
          DEFAULT: 'var(--border)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.5' }],
        'lg': ['1.125rem', { lineHeight: '1.5' }],
        'xl': ['1.25rem', { lineHeight: '1.25' }],
        '2xl': ['1.5rem', { lineHeight: '1.25' }],
        '3xl': ['1.875rem', { lineHeight: '1.25' }],
        '4xl': ['2.25rem', { lineHeight: '1.25' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(28, 25, 23, 0.04)',
        'md': '0 4px 12px rgba(28, 25, 23, 0.06)',
        'lg': '0 12px 32px rgba(28, 25, 23, 0.08)',
        'glow': '0 0 24px rgba(217, 119, 87, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { boxShadow: '0 12px 32px rgba(28, 25, 23, 0.08), 0 0 0 0 rgba(217, 119, 87, 0.4)' },
          '50%': { boxShadow: '0 12px 32px rgba(28, 25, 23, 0.08), 0 0 0 12px rgba(217, 119, 87, 0)' },
        },
      },
    },
  },
  plugins: [],
}
