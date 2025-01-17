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
        /**
         * Temporary solution until we migrate to using GitHub Primer Design Tokens Directly.
         *
         * See https://primer.style/foundations/primitives/color
         */
        primer: {
          attention: '#9a6700',
          closed: '#d1242f',
          done: '#8250df',
          muted: '#59636e',
          open: '#1a7f37',
        },
        gitify: {
          background: 'var(--color-gitify-background)',
          font: 'var(--color-gitify-font)',
          error: colors.red[500],
          sidebar: '#24292e',
          footer: 'var(--color-gitify-footer)',
          accounts: {
            rest: 'var(--color-gitify-accounts-rest)',
            error: 'var(--color-gitify-accounts-error)',
          },
          repositories: 'var(--color-gitify-repositories)',
          notifications: {
            border: 'var(--color-gitify-notifications-border)',
            rest: 'var(--color-gitify-notifications-rest)',
            hover: 'var(--color-gitify-notifications-hover)',
          },
          tooltip: {
            icon: colors.blue[500],
            popout: 'var(--color-gitify-tooltip-popout)',
          },
          link: colors.blue[500],
          caution: colors.orange[600],
          settings: colors.blue[600],
          pill: {
            rest: 'var(--color-gitify-pill-rest)',
            hover: 'var(--color-gitify-pill-hover)',
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
          '--color-gitify-background': colors.white,
          '--color-gitify-font': colors.gray[700],
          '--color-gitify-footer': colors.gray[200],
          '--color-gitify-accounts-rest': colors.gray[300],
          '--color-gitify-accounts-error': colors.red[300],
          '--color-gitify-repositories': colors.gray[100],
          '--color-gitify-notifications-border': colors.gray[100],
          '--color-gitify-notifications-rest': colors.white,
          '--color-gitify-notifications-hover': colors.gray[100],
          '--color-gitify-tooltip-popout': colors.white,
          '--color-gitify-pill-rest': colors.gray[100],
          '--color-gitify-pill-hover': colors.gray[200],
        },
        '.dark': {
          '--color-gitify-background': '#161b22',
          '--color-gitify-font': colors.gray[100],
          '--color-gitify-footer': '#000209',
          '--color-gitify-accounts-rest': '#000209',
          '--color-gitify-accounts-error': colors.red[500],
          '--color-gitify-repositories': '#090e15',
          '--color-gitify-notifications-border': '#090e15',
          '--color-gitify-notifications-rest': '#161b22',
          '--color-gitify-notifications-hover': '#090e15',
          '--color-gitify-tooltip-popout': '#24292e',
          '--color-gitify-pill-rest': colors.gray[800],
          '--color-gitify-pill-hover': colors.gray[700],
        },
      });
    },
  ],
};

export default config;
