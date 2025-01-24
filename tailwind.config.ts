import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

const sidebarWidth = '2.5rem'; // 40px

const config: Config = {
  content: ['./src/**/*.js', './src/**/*.ts', './src/**/*.tsx'],
  darkMode: 'class',
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
          font: 'var(--fgColor-default)',
          background: 'var(--bgColor-muted)',
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
  variants: {
    extend: {},
  },
  plugins: [
    ({ addBase }) => {
      // TODO - ideally we would move this to be controlled by GitHub Primer Design Tokens, colors and color schemes
      addBase({
        ':root': {
          '--gitify-scrollbar-track': colors.gray[100],
          '--gitify-scrollbar-thumb': colors.gray[300],
          '--gitify-scrollbar-thumb-hover': colors.gray[400],
        },
        '.dark': {
          '--gitify-scrollbar-track': colors.gray[900],
          '--gitify-scrollbar-thumb': colors.gray[700],
          '--gitify-scrollbar-thumb-hover': colors.gray[600],
        },
      });
    },
  ],
};

export default config;
