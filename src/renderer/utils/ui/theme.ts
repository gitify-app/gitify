import type { ThemeProviderProps } from '@primer/react';

import { DesignLanguage, Theme } from '../../types';

// Derived from public @primer/react component props rather than internal types
type ColorModeWithAuto = NonNullable<ThemeProviderProps['colorMode']>;

export const DEFAULT_DAY_COLOR_SCHEME = 'light';
export const DEFAULT_NIGHT_COLOR_SCHEME = 'dark';
export const DEFAULT_DAY_HIGH_CONTRAST_COLOR_SCHEME = 'light_high_contrast';
export const DEFAULT_NIGHT_HIGH_CONTRAST_COLOR_SCHEME = 'dark_high_contrast';

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

export function mapThemeModeToColorScheme(themeMode: Theme, highContrast = false): string | null {
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

  return highContrast ? `${base}_high_contrast` : base;
}

/** The `Theme` values a design language exposes (Glass: light/dark/system only). */
export function supportedColorModes(designLanguage: DesignLanguage): Theme[] {
  if (designLanguage === DesignLanguage.GLASS) {
    return [Theme.SYSTEM, Theme.LIGHT, Theme.DARK];
  }

  return [
    Theme.SYSTEM,
    Theme.LIGHT,
    Theme.LIGHT_COLORBLIND,
    Theme.LIGHT_TRITANOPIA,
    Theme.DARK,
    Theme.DARK_COLORBLIND,
    Theme.DARK_TRITANOPIA,
    Theme.DARK_DIMMED,
  ];
}

/**
 * Clamps a stored color mode to what the active language supports (identity for
 * Classic). The stored `theme` is never mutated — clamping is render-time only —
 * so switching Glass → Classic restores the user's original scheme.
 */
export function resolveColorMode(designLanguage: DesignLanguage, theme: Theme): Theme {
  if (designLanguage !== DesignLanguage.GLASS) {
    return theme;
  }

  switch (theme) {
    case Theme.SYSTEM:
    case Theme.LIGHT:
    case Theme.DARK:
      return theme;
    case Theme.LIGHT_COLORBLIND:
    case Theme.LIGHT_TRITANOPIA:
      return Theme.LIGHT;
    default:
      return Theme.DARK;
  }
}
