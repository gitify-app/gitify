import { Theme } from '../types';
import {
  getTheme,
  mapThemeModeToColorScheme,
  setScrollbarTheme,
} from './theme';

describe('renderer/utils/theme.ts', () => {
  const htmlElement = document.createElement('html');

  beforeEach(() => {
    document.querySelector = jest.fn(() => htmlElement);
  });

  it('should change to light mode', () => {
    setScrollbarTheme('day');
    expect(getTheme()).toBe(Theme.LIGHT);
  });

  it('should change to dark mode', () => {
    setScrollbarTheme('night');
    expect(getTheme()).toBe(Theme.DARK);
  });

  it("should use the system's mode - light", () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((_query) => ({
        matches: false,
      })),
    });
    setScrollbarTheme();
    expect(getTheme()).toBe(Theme.LIGHT);
  });

  it("should use the system's mode - dark", () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((_query) => ({
        matches: true,
      })),
    });
    setScrollbarTheme();
    expect(getTheme()).toBe(Theme.DARK);
  });

  it('should map theme mode to github primer provider', () => {
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
