import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';
import plugin from 'tailwindcss/plugin';

const sidebarWidth = '2.5rem'; // 40px

const config: Config = {
  content: ['./src/**/*.ts', './src/**/*.tsx'],
  darkMode: ['class', '[data-color-mode="dark"]'], // GitHub Primer Theme Provider color mode custom selector
  theme: {
    extend: {
      fontSize: {
        xxs: '0.625rem', // 10px
      },
      keyframes: {
        'login-fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'login-panel-fade': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'login-fade-up': 'login-fade-up 360ms cubic-bezier(0.2, 0.7, 0.2, 1) both',
        'login-panel-fade': 'login-panel-fade 220ms cubic-bezier(0.2, 0.7, 0.2, 1) both',
      },
      transitionTimingFunction: {
        'login-out': 'cubic-bezier(0.2, 0.7, 0.2, 1)',
      },
      spacing: {
        sidebar: sidebarWidth,
      },
      width: {
        sidebar: sidebarWidth,
      },
      colors: {
        gitify: {
          font: 'var(--fgColor-default)',
          sidebar: '#24292e',
          footer: 'var(--bgColor-neutral-muted)',

          caution: colors.orange[600],
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

          success: colors.green[500],
          danger: colors.red[500],
          warning: colors.orange[500],

          account: {
            rest: 'var(--control-bgColor-active)',
            error: 'var(--gitify-account-error-bg)',
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
  plugins: [
    plugin(({ addBase, addComponents }) => {
      addComponents({
        '.gitify-scope-row': {
          '@apply rounded-md bg-gitify-accounts': {},
        },
      });
      // TODO - ideally we would use GitHub Primer Design Tokens instead of TailwindCSS
      addBase({
        '[data-color-mode="light"]': {
          '--gitify-background': 'var(--bgColor-default)',
          '--gitify-account-error-bg': 'var(--bgColor-danger-muted)',

          '--gitify-scrollbar-track': colors.gray[100],
          '--gitify-scrollbar-thumb': colors.gray[300],
          '--gitify-scrollbar-thumb-hover': colors.gray[400],

          '--gitify-counter-primary': colors.blue[300],
          '--gitify-counter-secondary': colors.gray[200],
          '--gitify-counter-text': colors.gray[800],
        },
        '[data-color-mode="dark"]': {
          '--gitify-background': 'var(--bgColor-muted)',
          '--gitify-account-error-bg': 'var(--bgColor-danger-emphasis)',

          '--gitify-scrollbar-track': colors.gray[900],
          '--gitify-scrollbar-thumb': colors.gray[700],
          '--gitify-scrollbar-thumb-hover': colors.gray[600],

          '--gitify-counter-primary': colors.blue[400],
          '--gitify-counter-secondary': colors.gray[600],
          '--gitify-counter-text': colors.gray[100],
        },
      });
    }),
  ],
};

export default config;
