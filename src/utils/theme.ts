import { Theme } from '../types';

export function getTheme(): Theme {
  if (document.querySelector('html').classList.contains('dark')) {
    return Theme.DARK;
  }

  return Theme.LIGHT;
}

export const setLightMode = () => {
  document.querySelector('html').classList.remove('dark');
};

export const setDarkMode = () => {
  document.querySelector('html').classList.add('dark');
};

export const setTheme = (mode?: Theme) => {
  switch (mode) {
    case Theme.LIGHT:
      setLightMode();
      break;

    case Theme.DARK:
      setDarkMode();
      break;

    default:
      if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        setDarkMode();
      } else {
        setLightMode();
      }
  }
};
