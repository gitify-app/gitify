import type { Config } from 'tailwindcss';

const sidebarWidth = '2.5rem'; // 40px

const config: Config = {
  content: ['./src/**/*.js', './src/**/*.ts', './src/**/*.tsx', './index.html'],
  darkMode: ['class', '[data-color-mode="dark"]'], // GitHub Primer Theme Provider color mode custom selector
  theme: {
    extend: {
      fontSize: {
        xxs: '0.625rem', // 10px
      },
      spacing: {
        sidebar: sidebarWidth,
      },
      width: {
        sidebar: sidebarWidth,
      },
      colors: {
        gitify: {
          background: 'var(--gitify-background)',
          font: 'var(--fgColor-default)',
          sidebar: '#24292e',
          footer: 'var(--bgColor-neutral-muted)',

          caution: '#ea580c', // Tailwind orange-600
          error: 'var(--fgColor-danger)',
          link: 'var(--fgColor-link)',
          input: {
            rest: 'var(--control-bgColor-rest)',
            focus: 'var(--control-bgColor-active)',
          },

          icon: {
            attention: 'var(--fgColor-attention)',
            closed: 'var(--fgColor-closed)',
            done: 'var(--fgColor-done)',
            muted: 'var(--fgColor-muted)',
            open: 'var(--fgColor-open)',
          },

          counter: {
            text: 'var(--gitify-counter-text)',
            primary: 'var(--gitify-counter-primary)',
            secondary: 'var(--gitify-counter-secondary)',
          },

          accounts: 'var(--bgColor-neutral-muted)',

          account: {
            rest: 'var(--control-bgColor-active)',
            error: 'var(--bgColor-danger-emphasis)',
          },

          repository: 'var(--control-bgColor-disabled)',

          notification: {
            border: 'var(--borderColor-disabled)',
            hover: 'var(--control-bgColor-hover)',
            pill: {
              hover: 'var(--control-bgColor-active)',
            },
          },

          tooltip: {
            icon: 'var(--fgColor-accent)',
            popout: 'var(--bgColor-disabled)',
          },
        },
      },
    },
  },
  // Note: CSS variables for gitify-* are defined in App.css for Tailwind v4 compatibility
  plugins: [],
};

export default config;
