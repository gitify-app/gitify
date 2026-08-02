import { DesignLanguage, Theme } from '../../types';

import {
  DEFAULT_DAY_COLOR_SCHEME,
  DEFAULT_DAY_HIGH_CONTRAST_COLOR_SCHEME,
  DEFAULT_NIGHT_COLOR_SCHEME,
  DEFAULT_NIGHT_HIGH_CONTRAST_COLOR_SCHEME,
  mapThemeModeToColorMode,
  mapThemeModeToColorScheme,
  resolveColorMode,
  supportedColorModes,
} from './theme';

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
    expect(mapThemeModeToColorScheme(Theme.LIGHT)).toBe('light');
    expect(mapThemeModeToColorScheme(Theme.LIGHT_COLORBLIND)).toBe('light_colorblind');
    expect(mapThemeModeToColorScheme(Theme.LIGHT_TRITANOPIA)).toBe('light_tritanopia');
    expect(mapThemeModeToColorScheme(Theme.DARK)).toBe('dark');
    expect(mapThemeModeToColorScheme(Theme.DARK_COLORBLIND)).toBe('dark_colorblind');
    expect(mapThemeModeToColorScheme(Theme.DARK_TRITANOPIA)).toBe('dark_tritanopia');
    expect(mapThemeModeToColorScheme(Theme.DARK_DIMMED)).toBe('dark_dimmed');
    expect(mapThemeModeToColorScheme(Theme.SYSTEM)).toBe(null);
  });

  it('appends the high-contrast variant when requested', () => {
    expect(mapThemeModeToColorScheme(Theme.LIGHT, true)).toBe('light_high_contrast');
    expect(mapThemeModeToColorScheme(Theme.DARK, true)).toBe('dark_high_contrast');
    expect(mapThemeModeToColorScheme(Theme.DARK_DIMMED, true)).toBe('dark_dimmed_high_contrast');
    expect(mapThemeModeToColorScheme(Theme.LIGHT_COLORBLIND, true)).toBe(
      'light_colorblind_high_contrast',
    );
    expect(mapThemeModeToColorScheme(Theme.SYSTEM, true)).toBe(null);
  });

  it('should export default color scheme constants', () => {
    expect(DEFAULT_DAY_COLOR_SCHEME).toBe('light');
    expect(DEFAULT_NIGHT_COLOR_SCHEME).toBe('dark');
    expect(DEFAULT_DAY_HIGH_CONTRAST_COLOR_SCHEME).toBe('light_high_contrast');
    expect(DEFAULT_NIGHT_HIGH_CONTRAST_COLOR_SCHEME).toBe('dark_high_contrast');
  });

  describe('supportedColorModes', () => {
    it('Classic supports the full palette including accessibility variants', () => {
      expect(supportedColorModes(DesignLanguage.CLASSIC)).toEqual([
        Theme.SYSTEM,
        Theme.LIGHT,
        Theme.LIGHT_COLORBLIND,
        Theme.LIGHT_TRITANOPIA,
        Theme.DARK,
        Theme.DARK_COLORBLIND,
        Theme.DARK_TRITANOPIA,
        Theme.DARK_DIMMED,
      ]);
    });

    it('Glass supports only light / dark / system', () => {
      expect(supportedColorModes(DesignLanguage.GLASS)).toEqual([
        Theme.SYSTEM,
        Theme.LIGHT,
        Theme.DARK,
      ]);
    });
  });

  describe('resolveColorMode', () => {
    it('is the identity for Classic (every value supported)', () => {
      for (const mode of supportedColorModes(DesignLanguage.CLASSIC)) {
        expect(resolveColorMode(DesignLanguage.CLASSIC, mode)).toBe(mode);
      }
    });

    it('keeps system / light / dark unchanged under Glass', () => {
      expect(resolveColorMode(DesignLanguage.GLASS, Theme.SYSTEM)).toBe(Theme.SYSTEM);
      expect(resolveColorMode(DesignLanguage.GLASS, Theme.LIGHT)).toBe(Theme.LIGHT);
      expect(resolveColorMode(DesignLanguage.GLASS, Theme.DARK)).toBe(Theme.DARK);
    });

    it('clamps Classic-only variants to their base light/dark under Glass', () => {
      expect(resolveColorMode(DesignLanguage.GLASS, Theme.LIGHT_COLORBLIND)).toBe(Theme.LIGHT);
      expect(resolveColorMode(DesignLanguage.GLASS, Theme.LIGHT_TRITANOPIA)).toBe(Theme.LIGHT);
      expect(resolveColorMode(DesignLanguage.GLASS, Theme.DARK_COLORBLIND)).toBe(Theme.DARK);
      expect(resolveColorMode(DesignLanguage.GLASS, Theme.DARK_TRITANOPIA)).toBe(Theme.DARK);
      expect(resolveColorMode(DesignLanguage.GLASS, Theme.DARK_DIMMED)).toBe(Theme.DARK);
    });
  });
});
