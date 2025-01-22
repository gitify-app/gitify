import { ThemeMode } from '../types';
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
    expect(getTheme()).toBe(ThemeMode.LIGHT_DEFAULT);
  });

  it('should change to dark mode', () => {
    setScrollbarTheme('night');
    expect(getTheme()).toBe(ThemeMode.DARK_DEFAULT);
  });

  it("should use the system's mode - light", () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((_query) => ({
        matches: false,
      })),
    });
    setScrollbarTheme();
    expect(getTheme()).toBe(ThemeMode.LIGHT_DEFAULT);
  });

  it("should use the system's mode - dark", () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((_query) => ({
        matches: true,
      })),
    });
    setScrollbarTheme();
    expect(getTheme()).toBe(ThemeMode.DARK_DEFAULT);
  });

  it('should map theme mode to github primer provider', () => {
    expect(mapThemeModeToColorScheme(ThemeMode.LIGHT_DEFAULT)).toBe('light');
    expect(mapThemeModeToColorScheme(ThemeMode.LIGHT_HIGH_CONTRAST)).toBe(
      'light_high_contrast',
    );
    expect(mapThemeModeToColorScheme(ThemeMode.LIGHT_COLOR_BLIND)).toBe(
      'light_colorblind',
    );
    expect(mapThemeModeToColorScheme(ThemeMode.LIGHT_TRITANOPIA)).toBe(
      'light_tritanopia',
    );
    expect(mapThemeModeToColorScheme(ThemeMode.DARK_DEFAULT)).toBe('dark');
    expect(mapThemeModeToColorScheme(ThemeMode.DARK_HIGH_CONTRAST)).toBe(
      'dark_high_contrast',
    );
    expect(mapThemeModeToColorScheme(ThemeMode.DARK_COLOR_BLIND)).toBe(
      'dark_colorblind',
    );
    expect(mapThemeModeToColorScheme(ThemeMode.DARK_TRITANOPIA)).toBe(
      'dark_tritanopia',
    );
    expect(mapThemeModeToColorScheme(ThemeMode.DARK_DIMMED)).toBe(
      'dark_dimmed',
    );
    expect(mapThemeModeToColorScheme(ThemeMode.SYSTEM)).toBe(null);
  });
});
