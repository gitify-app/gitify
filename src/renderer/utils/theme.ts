import type { ColorModeWithAuto } from '@primer/react/lib/ThemeProvider';
import { Theme } from '../types';

export const DEFAULT_DAY_COLOR_SCHEME = 'light';
export const DEFAULT_NIGHT_COLOR_SCHEME = 'dark';

export function mapThemeModeToColorMode(themeMode: Theme): ColorModeWithAuto {
  switch (themeMode) {
    case Theme.LIGHT:
    case Theme.LIGHT_HIGH_CONTRAST:
    case Theme.LIGHT_COLORBLIND:
    case Theme.LIGHT_TRITANOPIA:
      return 'day';
    case Theme.DARK:
    case Theme.DARK_HIGH_CONTRAST:
    case Theme.DARK_COLORBLIND:
    case Theme.DARK_TRITANOPIA:
    case Theme.DARK_DIMMED:
      return 'night';
    default:
      return 'auto';
  }
}

export function mapThemeModeToColorScheme(themeMode: Theme): string | null {
  switch (themeMode) {
    case Theme.LIGHT:
      return 'light';
    case Theme.LIGHT_HIGH_CONTRAST:
      return 'light_high_contrast';
    case Theme.LIGHT_COLORBLIND:
      return 'light_colorblind';
    case Theme.LIGHT_TRITANOPIA:
      return 'light_tritanopia';
    case Theme.DARK:
      return 'dark';
    case Theme.DARK_HIGH_CONTRAST:
      return 'dark_high_contrast';
    case Theme.DARK_COLORBLIND:
      return 'dark_colorblind';
    case Theme.DARK_TRITANOPIA:
      return 'dark_tritanopia';
    case Theme.DARK_DIMMED:
      return 'dark_dimmed';
    default:
      return null;
  }
}
