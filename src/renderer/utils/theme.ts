import type { ColorModeWithAuto } from '@primer/react/lib/ThemeProvider';

import { Theme } from '../types';

export const DEFAULT_DAY_COLOR_SCHEME = 'light';
export const DEFAULT_NIGHT_COLOR_SCHEME = 'dark';

export function mapThemeModeToColorMode(themeMode: Theme): ColorModeWithAuto {
  switch (themeMode) {
    case Theme.LIGHT:
    case Theme.LIGHT_COLORBLIND:
    case Theme.LIGHT_TRITANOPIA:
      return 'day';
    case Theme.DARK:
    case Theme.DARK_COLORBLIND:
    case Theme.DARK_TRITANOPIA:
    case Theme.DARK_DIMMED:
      return 'night';
    default:
      return 'auto';
  }
}

export function mapThemeModeToColorScheme(
  themeMode: Theme,
  increaseContrast: boolean,
): string | null {
  let base: string | null;

  switch (themeMode) {
    case Theme.LIGHT:
      base = 'light';
      break;
    case Theme.LIGHT_COLORBLIND:
      base = 'light_colorblind';
      break;
    case Theme.LIGHT_TRITANOPIA:
      base = 'light_tritanopia';
      break;
    case Theme.DARK:
      base = 'dark';
      break;
    case Theme.DARK_COLORBLIND:
      base = 'dark_colorblind';
      break;
    case Theme.DARK_TRITANOPIA:
      base = 'dark_tritanopia';
      break;
    case Theme.DARK_DIMMED:
      base = 'dark_dimmed';
      break;
    default:
      return null;
  }

  return increaseContrast ? `${base}_high_contrast` : base;
}
