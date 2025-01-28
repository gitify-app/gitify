import { Theme } from '../types';
import { mapThemeModeToColorMode, mapThemeModeToColorScheme } from './theme';

describe('renderer/utils/theme.ts', () => {
  it('should map theme mode to github primer color mode', () => {
    expect(mapThemeModeToColorMode(Theme.LIGHT)).toBe('day');
    expect(mapThemeModeToColorMode(Theme.LIGHT_HIGH_CONTRAST)).toBe('day');
    expect(mapThemeModeToColorMode(Theme.LIGHT_COLORBLIND)).toBe('day');
    expect(mapThemeModeToColorMode(Theme.LIGHT_TRITANOPIA)).toBe('day');
    expect(mapThemeModeToColorMode(Theme.DARK)).toBe('night');
    expect(mapThemeModeToColorMode(Theme.DARK_HIGH_CONTRAST)).toBe('night');
    expect(mapThemeModeToColorMode(Theme.DARK_COLORBLIND)).toBe('night');
    expect(mapThemeModeToColorMode(Theme.DARK_TRITANOPIA)).toBe('night');
    expect(mapThemeModeToColorMode(Theme.DARK_DIMMED)).toBe('night');
    expect(mapThemeModeToColorMode(Theme.SYSTEM)).toBe('auto');
  });

  it('should map theme mode to github primer color scheme', () => {
    expect(mapThemeModeToColorScheme(Theme.LIGHT)).toBe('light');
    expect(mapThemeModeToColorScheme(Theme.LIGHT_HIGH_CONTRAST)).toBe(
      'light_high_contrast',
    );
    expect(mapThemeModeToColorScheme(Theme.LIGHT_COLORBLIND)).toBe(
      'light_colorblind',
    );
    expect(mapThemeModeToColorScheme(Theme.LIGHT_TRITANOPIA)).toBe(
      'light_tritanopia',
    );
    expect(mapThemeModeToColorScheme(Theme.DARK)).toBe('dark');
    expect(mapThemeModeToColorScheme(Theme.DARK_HIGH_CONTRAST)).toBe(
      'dark_high_contrast',
    );
    expect(mapThemeModeToColorScheme(Theme.DARK_COLORBLIND)).toBe(
      'dark_colorblind',
    );
    expect(mapThemeModeToColorScheme(Theme.DARK_TRITANOPIA)).toBe(
      'dark_tritanopia',
    );
    expect(mapThemeModeToColorScheme(Theme.DARK_DIMMED)).toBe('dark_dimmed');
    expect(mapThemeModeToColorScheme(Theme.SYSTEM)).toBe(null);
  });
});
