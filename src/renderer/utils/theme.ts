import { Theme } from '../types';

export function getTheme(): Theme {
  if (document.querySelector('html').classList.contains('dark')) {
    return Theme.DARK;
  }

  return Theme.LIGHT;
}

export function setLightMode() {
  document.querySelector('html').classList.remove('dark');
}

export function setDarkMode() {
  document.querySelector('html').classList.add('dark');
}

export function setTheme(mode?: Theme) {
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
}
