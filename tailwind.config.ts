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
          font: 'var(--color-gitify-font)',
          failure: colors.red[500],
          error: 'var(--color-gitify-error)',
          sidebar: '#24292e',
          footer: 'var(--color-gitify-footer)',
          accounts: 'var(--color-gitify-accounts)',
          notifications: 'var(--color-gitify-notifications)',
          tooltip: {
            icon: colors.blue[500],
            popout: 'var(--color-gitify-tooltip-popout)',
          },
          link: colors.blue[500],
          caution: colors.orange[600],
          settings: colors.blue[600],
        },
        /** Deprecated - retire the below */
        gray: {
          dark: '#161b22',
          darker: '#090E15',
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
          '--color-gitify-font': colors.gray[700],
          '--color-gitify-error': colors.red[300],
          '--color-gitify-footer': colors.gray[200],
          '--color-gitify-accounts': colors.gray[300],
          '--color-gitify-repository': colors.gray[100],
          '--color-gitify-tooltip-popout': colors.white,
        },
        '.dark': {
          '--color-gitify-font': colors.gray[200],
          '--color-gitify-error': colors.red[500],
          '--color-gitify-footer': '#000209',
          '--color-gitify-accounts': '#000209',
          '--color-gitify-repository': '#090e15',
          '--color-gitify-tooltip-popout': '#24292e',
        },
      });
    },
  ],
};

export default config;
