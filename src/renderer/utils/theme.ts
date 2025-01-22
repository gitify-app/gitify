import type { ColorModeWithAuto } from '@primer/react/lib/ThemeProvider';
import { ThemeMode } from '../types';

export const DEFAULT_DAY_COLOR_SCHEME = 'light';
export const DEFAULT_NIGHT_COLOR_SCHEME = 'dark';

/**
 * @deprecated
 */
export function getTheme(): ThemeMode {
  if (document.querySelector('html').classList.contains('dark')) {
    return ThemeMode.DARK_DEFAULT;
  }

  return ThemeMode.LIGHT_DEFAULT;
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

/**
 * @deprecated
 */
export function setScrollbarTheme(mode?: ColorModeWithAuto) {
  switch (mode) {
    case 'day':
    case 'light':
      setLightMode();
      break;
    case 'night':
    case 'dark':
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

export function isDayScheme(themeMode: ThemeMode) {
  switch (themeMode) {
    case ThemeMode.LIGHT_DEFAULT:
    case ThemeMode.LIGHT_HIGH_CONTRAST:
    case ThemeMode.LIGHT_COLOR_BLIND:
    case ThemeMode.LIGHT_TRITANOPIA:
      return true;
    default:
      return false;
  }
}

export function mapThemeModeToColorScheme(themeMode: ThemeMode): string | null {
  switch (themeMode) {
    case ThemeMode.LIGHT_DEFAULT:
      return 'light';
    case ThemeMode.LIGHT_HIGH_CONTRAST:
      return 'light_high_contrast';
    case ThemeMode.LIGHT_COLOR_BLIND:
      return 'light_colorblind';
    case ThemeMode.LIGHT_TRITANOPIA:
      return 'light_tritanopia';
    case ThemeMode.DARK_DEFAULT:
      return 'dark';
    case ThemeMode.DARK_HIGH_CONTRAST:
      return 'dark_high_contrast';
    case ThemeMode.DARK_COLOR_BLIND:
      return 'dark_colorblind';
    case ThemeMode.DARK_TRITANOPIA:
      return 'dark_tritanopia';
    case ThemeMode.DARK_DIMMED:
      return 'dark_dimmed';
    default:
      return null;
  }
}
