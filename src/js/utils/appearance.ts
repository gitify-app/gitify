import { Appearance } from '../../types';

export const setAppearance = (mode: Appearance) => {
  const htmlClassList = document.querySelector('html').classList;
  const setLightMode = () => htmlClassList.remove('dark');
  const setDarkMode = () => htmlClassList.add('dark');

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
