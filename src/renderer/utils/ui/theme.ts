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

/**
 * The color-mode (`Theme`) values a design language supports. Classic exposes
 * the full palette including the accessibility variants; Glass offers only
 * light / dark / system (its accessibility story is degradation to solid
 * surfaces, not bespoke colorblind/tritanopia palettes).
 */
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
 * Clamp a stored color mode to the nearest value the active design language
 * supports. Classic is the identity (every value is supported), so existing
 * users are unaffected. For Glass, the accessibility/dimmed variants collapse
 * to their base light or dark.
 *
 * The stored `theme` is never mutated by a language switch — clamping happens
 * only at render/selection time — so switching Glass → Classic restores the
 * user's original scheme (e.g. `dark_dimmed`) unless they explicitly picked a
 * different one while on Glass.
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
