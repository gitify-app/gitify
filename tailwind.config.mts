import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';
import plugin from 'tailwindcss/plugin';

const sidebarWidth = '2.5rem'; // 40px

const config: Config = {
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
        'login-panel-in-right': {
          '0%': { opacity: '0', transform: 'translateX(6px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'login-panel-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-6px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'login-panel-out-left': {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(-6px)' },
        },
        'login-panel-out-right': {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(6px)' },
        },
      },
      animation: {
        'login-fade-up': 'login-fade-up 360ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'login-panel-in-right': 'login-panel-in-right 280ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'login-panel-in-left': 'login-panel-in-left 280ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'login-panel-out-left': 'login-panel-out-left 280ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'login-panel-out-right': 'login-panel-out-right 280ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      transitionTimingFunction: {
        'login-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
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
          background: 'var(--gitify-background)',
          sidebar: 'var(--gitify-sidebar)',
          footer: 'var(--gitify-footer)',

          caution: colors.orange[600],
          error: 'var(--fgColor-danger)',
          link: 'var(--gitify-link)',
          input: {
            rest: 'var(--control-bgColor-rest)',
            focus: 'var(--control-bgColor-active)',
          },

          icon: {
            attention: 'var(--gitify-icon-attention)',
            closed: 'var(--gitify-icon-closed)',
            done: 'var(--gitify-icon-done)',
            muted: 'var(--fgColor-muted)',
            open: 'var(--gitify-icon-open)',
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
    plugin((api) => {
      api.addComponents({
        '.gitify-scope-row': {
          '@apply rounded-md bg-gitify-accounts': {},
        },
      });
      api.addBase({
        '[data-color-mode]': {
          '--gitify-background': 'light-dark(var(--bgColor-default), var(--bgColor-muted))',
          '--gitify-account-error-bg':
            'light-dark(var(--bgColor-danger-muted), var(--bgColor-danger-emphasis))',

          '--gitify-scrollbar-track': 'var(--bgColor-muted)',
          '--gitify-scrollbar-thumb': 'var(--borderColor-default)',
          '--gitify-scrollbar-thumb-hover': 'var(--borderColor-emphasis)',

          '--gitify-counter-primary': 'var(--bgColor-accent-muted)',
          '--gitify-counter-secondary': 'var(--bgColor-neutral-muted)',
          '--gitify-counter-text': 'var(--fgColor-default)',
        },
      });
    }),
  ],
};

export default config;
