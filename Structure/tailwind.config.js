const flowbite = require('flowbite/plugin');

module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Outfit"', '"Inter"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.75rem', { lineHeight: '1rem' }],       // 12px
        'xs': ['0.8125rem', { lineHeight: '1.25rem' }],   // 13px
        'sm': ['0.875rem', { lineHeight: '1.375rem' }],   // 14px
        'base': ['0.9375rem', { lineHeight: '1.5rem' }],  // 15px
        'md': ['1rem', { lineHeight: '1.5rem' }],         // 16px
        'lg': ['1.125rem', { lineHeight: '1.625rem' }],   // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],     // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],        // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],   // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],     // 36px
      },

      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        textLight: "var(--color-text-light)",
        textGray: "var(--color-text-gray)",
        backgroundPrimary: "var(--background-primary)",
        panelColor: "var(--panel-color)",
        borderColor: "var(--border-color)",
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      }
    },
  },
  plugins: [
    flowbite
  ],
};