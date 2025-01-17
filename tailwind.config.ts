import type { Config } from 'tailwindcss';

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
        gray: {
          sidebar: '#24292e',
          dark: '#161b22',
          darker: '#090E15',
          darkest: '#000209',
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};

export default config;
