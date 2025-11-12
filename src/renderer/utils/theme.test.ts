import { describe, expect, it } from 'vitest';

import { Theme } from '../types';
import { mapThemeModeToColorMode, mapThemeModeToColorScheme } from './theme';

describe('renderer/utils/theme.ts', () => {
  it('should map theme mode to github primer color mode', () => {
    expect(mapThemeModeToColorMode(Theme.LIGHT)).toBe('day');
    expect(mapThemeModeToColorMode(Theme.LIGHT_COLORBLIND)).toBe('day');
    expect(mapThemeModeToColorMode(Theme.LIGHT_TRITANOPIA)).toBe('day');
    expect(mapThemeModeToColorMode(Theme.DARK)).toBe('night');
    expect(mapThemeModeToColorMode(Theme.DARK_COLORBLIND)).toBe('night');
    expect(mapThemeModeToColorMode(Theme.DARK_TRITANOPIA)).toBe('night');
    expect(mapThemeModeToColorMode(Theme.DARK_DIMMED)).toBe('night');
    expect(mapThemeModeToColorMode(Theme.SYSTEM)).toBe('auto');
  });

  it('should map theme mode to github primer color scheme', () => {
    expect(mapThemeModeToColorScheme(Theme.LIGHT, false)).toBe('light');
    expect(mapThemeModeToColorScheme(Theme.LIGHT, true)).toBe(
      'light_high_contrast',
    );
    expect(mapThemeModeToColorScheme(Theme.LIGHT_COLORBLIND, false)).toBe(
      'light_colorblind',
    );
    expect(mapThemeModeToColorScheme(Theme.LIGHT_COLORBLIND, true)).toBe(
      'light_colorblind_high_contrast',
    );
    expect(mapThemeModeToColorScheme(Theme.LIGHT_TRITANOPIA, false)).toBe(
      'light_tritanopia',
    );
    expect(mapThemeModeToColorScheme(Theme.LIGHT_TRITANOPIA, true)).toBe(
      'light_tritanopia_high_contrast',
    );
    expect(mapThemeModeToColorScheme(Theme.DARK, false)).toBe('dark');
    expect(mapThemeModeToColorScheme(Theme.DARK, true)).toBe(
      'dark_high_contrast',
    );
    expect(mapThemeModeToColorScheme(Theme.DARK_COLORBLIND, false)).toBe(
      'dark_colorblind',
    );
    expect(mapThemeModeToColorScheme(Theme.DARK_COLORBLIND, true)).toBe(
      'dark_colorblind_high_contrast',
    );
    expect(mapThemeModeToColorScheme(Theme.DARK_TRITANOPIA, false)).toBe(
      'dark_tritanopia',
    );
    expect(mapThemeModeToColorScheme(Theme.DARK_TRITANOPIA, true)).toBe(
      'dark_tritanopia_high_contrast',
    );
    expect(mapThemeModeToColorScheme(Theme.DARK_DIMMED, false)).toBe(
      'dark_dimmed',
    );
    expect(mapThemeModeToColorScheme(Theme.DARK_DIMMED, true)).toBe(
      'dark_dimmed_high_contrast',
    );
    expect(mapThemeModeToColorScheme(Theme.SYSTEM, false)).toBe(null);
  });
});
