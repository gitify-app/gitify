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
