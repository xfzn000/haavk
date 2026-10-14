/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        haavk: {
          blue: '#2379D8',
          'blue-light': '#58B8F4',
          'blue-deep': '#1B5FAE',
          bg: '#E9EEF4',
          panel: 'rgba(245,248,252,.82)',
          'panel-solid': '#F5F8FC',
          dark: '#252A30',
          'dark-2': '#1B1F24',
          text: '#182027',
          muted: '#68727C',
          border: '#B9C8D8',
          red: '#E53B3B',
          amber: '#D9902B',
          green: '#2EA36B',
        },
      },
      fontFamily: {
        sans: [
          '"HarmonyOS Sans SC"',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          '"Cascadia Mono"',
          'Consolas',
          '"Courier New"',
          'monospace',
        ],
      },
      fontSize: {
        hud: ['12px', { lineHeight: '16px', letterSpacing: '0.06em' }],
        aux: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        title: ['20px', { lineHeight: '28px' }],
        page: ['28px', { lineHeight: '36px' }],
        big: ['48px', { lineHeight: '56px' }],
        hero: ['64px', { lineHeight: '72px' }],
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
        12: '48px',
        16: '64px',
      },
      borderRadius: {
        none: '0',
        haavk: '2px',
        'haavk-lg': '4px',
      },
      boxShadow: {
        hud: '0 1px 0 rgba(35,121,216,.10), 0 8px 24px -16px rgba(24,32,39,.35)',
        panel: '0 2px 10px -6px rgba(24,32,39,.30)',
      },
      transitionDuration: {
        hud: '180ms',
      },
      backgroundImage: {
        'haavk-stripe':
          'repeating-linear-gradient(135deg, rgba(35,121,216,.18) 0 6px, transparent 6px 12px)',
      },
      keyframes: {
        'hud-scan': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '50%': { opacity: '.5' },
          '100%': { transform: 'translateY(220%)', opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'hud-scan': 'hud-scan 5.5s ease-in-out infinite',
        'fade-in': 'fade-in 240ms ease-out both',
      },
    },
  },
  plugins: [],
}
