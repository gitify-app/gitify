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
        primer: {
          attention: 'var(--fgColor-attention)',
          closed: 'var(--fgColor-closed)',
          done: 'var(--fgColor-done)',
          muted: 'var(--fgColor-muted)',
          open: 'var(--fgColor-open)',
        },
        gitify: {
          background: 'var(--gitify-background)',
          font: 'var(--gitify-font)',
          error: 'var(--fgColor-danger)',
          sidebar: '#24292e',
          footer: 'var(--gitify-footer)',
          accounts: {
            rest: 'var(--gitify-accounts-rest)',
            error: 'var(--gitify-accounts-error)',
          },
          repositories: 'var(--gitify-repositories)',
          notifications: {
            border: 'var(--gitify-notifications-border)',
            rest: 'var(--gitify-notifications-rest)',
            hover: 'var(--gitify-notifications-hover)',
          },
          tooltip: {
            icon: 'var(--fgColor-accent)',
            popout: 'var(--gitify-tooltip-popout)',
          },
          link: 'var(--fgColor-link)',
          caution: colors.orange[600],
          pill: {
            rest: 'var(--gitify-pill-rest)',
            hover: 'var(--gitify-pill-hover)',
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
          '--gitify-font': colors.gray[700],
          '--gitify-footer': colors.gray[200],

          '--gitify-accounts-rest': colors.gray[300],
          '--gitify-accounts-error': colors.red[300],

          '--gitify-repositories': colors.gray[100],

          '--gitify-notifications-border': colors.gray[100],
          '--gitify-notifications-rest': colors.white,
          '--gitify-notifications-hover': colors.gray[100],
          '--gitify-tooltip-popout': colors.white,
          '--gitify-pill-rest': colors.gray[100],
          '--gitify-pill-hover': colors.gray[200],

          '--gitify-scrollbar-track': colors.gray[100],
          '--gitify-scrollbar-thumb': colors.gray[400],
          '--gitify-scrollbar-thumb-hover': colors.gray[500],
        },
        '.dark': {
          '--gitify-background': '#161b22',
          '--gitify-font': colors.gray[100],
          '--gitify-footer': '#000209',

          '--gitify-accounts-rest': '#000209',
          '--gitify-accounts-error': colors.red[500],

          '--gitify-repositories': '#090e15',

          '--gitify-notifications-border': '#090e15',
          '--gitify-notifications-rest': '#161b22',
          '--gitify-notifications-hover': '#090e15',
          '--gitify-tooltip-popout': '#24292e',
          '--gitify-pill-rest': colors.gray[800],
          '--gitify-pill-hover': colors.gray[700],

          '--gitify-scrollbar-track': '#090e15',
          '--gitify-scrollbar-thumb': '#24292e',
          '--gitify-scrollbar-thumb-hover': '#3a3f44',
        },
      });
    },
  ],
};

export default config;
