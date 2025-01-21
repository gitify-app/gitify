import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

const config: Config = {
  content: ['./src/**/*.js', './src/**/*.ts', './src/**/*.tsx'],
  darkMode: 'class',
  theme: {
    extend: {
      fontSize: {
        xxs: '0.625rem', // 10px
      },
      colors: {
        gitify: {
          font: 'var(--fgColor-default)',
          background: 'var(--gitify-background)',
          sidebar: '#24292e',
          footer: 'var(--gitify-footer)',

          caution: colors.orange[600],
          error: 'var(--fgColor-danger)',
          link: 'var(--fgColor-link)',

          icon: {
            attention: 'var(--fgColor-attention)',
            closed: 'var(--fgColor-closed)',
            done: 'var(--fgColor-done)',
            muted: 'var(--fgColor-muted)',
            open: 'var(--fgColor-open)',
          },

          account: {
            rest: 'var(--gitify-account-rest)',
            error: 'var(--gitify-account-error)',
          },

          repository: 'var(--gitify-repository)',

          notification: {
            border: 'var(--control-bgColor-hover)',
            hover: 'var(--control-bgColor-hover)',
            pill: {
              rest: 'var(--gitify-notification-pill-rest)',
              hover: 'var(--gitify-notification-pill-hover)',
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
  variants: {
    extend: {},
  },
  plugins: [
    ({ addBase }) => {
      addBase({
        ':root': {
          '--gitify-background': colors.white,
          '--gitify-footer': colors.gray[200],

          '--gitify-account-rest': colors.gray[300],
          '--gitify-account-error': colors.red[300],

          '--gitify-repository': colors.gray[100],

          '--gitify-notification-pill-rest': colors.gray[100],
          '--gitify-notification-pill-hover': colors.gray[200],

          '--gitify-scrollbar-track': colors.gray[100],
          '--gitify-scrollbar-thumb': colors.gray[400],
          '--gitify-scrollbar-thumb-hover': colors.gray[500],
        },
        '.dark': {
          '--gitify-background': '#161b22',
          '--gitify-footer': '#000209',

          '--gitify-account-rest': '#000209',
          '--gitify-account-error': colors.red[500],

          '--gitify-repository': '#090e15',

          '--gitify-notification-pill-rest': colors.gray[800],
          '--gitify-notification-pill-hover': colors.gray[700],

          '--gitify-scrollbar-track': '#090e15',
          '--gitify-scrollbar-thumb': '#24292e',
          '--gitify-scrollbar-thumb-hover': '#3a3f44',
        },
      });
    },
  ],
};

export default config;
