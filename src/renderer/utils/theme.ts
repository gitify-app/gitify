import type { ColorModeWithAuto } from '@primer/react/lib/ThemeProvider';
import { Theme } from '../types';

// TODO Add support for setting color modes (dark_dimmed) - see #1748

// TODO - Replace fully with Octicon primer theme provider
/**
 * @deprecated
 */
export function getTheme(): Theme {
  if (document.querySelector('html').classList.contains('dark')) {
    return Theme.DARK;
  }

  return Theme.LIGHT;
}

/**
 * @deprecated
 */
export function setLightMode() {
  document.querySelector('html').classList.remove('dark');
}

/**
 * @deprecated
 */
export function setDarkMode() {
  document.querySelector('html').classList.add('dark');
}

export function setTheme(theme?: Theme) {
  switch (theme) {
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

export function getColorModeFromTheme(theme: Theme): ColorModeWithAuto {
  switch (theme) {
    case Theme.LIGHT:
      return 'day';
    case Theme.DARK:
      return 'night';
    default:
      return 'auto';
  }
}
