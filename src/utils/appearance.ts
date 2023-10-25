import { Appearance } from '../types';

export const setLightMode = () =>
  document.getElementsByTagName('html')[0].classList.remove('dark');

export const setDarkMode = () =>
  document.getElementsByTagName('html')[0].classList.add('dark');

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
