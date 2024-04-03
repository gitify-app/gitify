import { Theme } from '../types';
import { setTheme } from './theme';

import * as appearanceHelpers from './theme';

describe('utils/appearance.ts', () => {
  beforeAll(() => {
    jest.spyOn(appearanceHelpers, 'setLightMode');
    jest.spyOn(appearanceHelpers, 'setDarkMode');
  });

  beforeEach(() => {
    // @ts-ignore
    appearanceHelpers.setLightMode.mockReset();
    // @ts-ignore
    appearanceHelpers.setDarkMode.mockReset();
  });

  it('should change to light mode', () => {
    setTheme(Theme.LIGHT);
    expect(appearanceHelpers.setLightMode).toHaveBeenCalledTimes(1);
  });

  it('should change to dark mode', () => {
    setTheme(Theme.DARK);
    expect(appearanceHelpers.setDarkMode).toHaveBeenCalledTimes(1);
  });

  it("should use the system's mode - light", () => {
    setTheme();
    expect(appearanceHelpers.setLightMode).toHaveBeenCalledTimes(1);
  });

  it("should use the system's mode - dark", () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: true,
      })),
    });
    setTheme();
    expect(appearanceHelpers.setDarkMode).toHaveBeenCalledTimes(1);
  });
});
