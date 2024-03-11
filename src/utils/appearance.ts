import { Appearance } from '../types';

export function getAppearance(): Appearance {
  if (document.querySelector('html').classList.contains('dark')) {
    return Appearance.DARK;
  }

  return Appearance.LIGHT;
}

export const setLightMode = () =>
  document.querySelector('html').classList.remove('dark');

export const setDarkMode = () =>
  document.querySelector('html').classList.add('dark');

export const setAppearance = (mode?: Appearance) => {
  switch (mode) {
    case Appearance.LIGHT:
      setLightMode();
      break;

    case Appearance.DARK:
      setDarkMode();
      break;

    default:
      if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        setDarkMode();
      } else {
        setLightMode();
      }
  }
};
