import { Theme } from '../types';
import { getTheme, setTheme } from './theme';

describe('utils/theme.ts', () => {
  const htmlElement = document.createElement('html');

  beforeEach(() => {
    document.querySelector = jest.fn(() => htmlElement);
  });

  it('should change to light mode', () => {
    setTheme(Theme.LIGHT);
    expect(getTheme()).toBe(Theme.LIGHT);
  });

  it('should change to dark mode', () => {
    setTheme(Theme.DARK);
    expect(getTheme()).toBe(Theme.DARK);
  });

  it("should use the system's mode - light", () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((_query) => ({
        matches: false,
      })),
    });
    setTheme();
    expect(getTheme()).toBe(Theme.LIGHT);
  });

  it("should use the system's mode - dark", () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((_query) => ({
        matches: true,
      })),
    });
    setTheme();
    expect(getTheme()).toBe(Theme.DARK);
  });
});
