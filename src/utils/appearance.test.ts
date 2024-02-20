import { Appearance } from '../types';
import { setAppearance } from './appearance';

import * as appearanceHelpers from './appearance';

describe('utils/appearance.tsx', () => {
  beforeAll(() => {
    jest.spyOn(appearanceHelpers, 'setLightMode');
    jest.spyOn(appearanceHelpers, 'setDarkMode');
  });

  beforeEach(() => {
    // @ts-expect-error mockReset
    appearanceHelpers.setLightMode.mockReset();
    // @ts-expect-error mockReset
    appearanceHelpers.setDarkMode.mockReset();
  });

  it('should change to light mode', () => {
    setAppearance(Appearance.LIGHT);
    expect(appearanceHelpers.setLightMode).toHaveBeenCalledTimes(1);
  });

  it('should change to dark mode', () => {
    setAppearance(Appearance.DARK);
    expect(appearanceHelpers.setDarkMode).toHaveBeenCalledTimes(1);
  });

  it("should use the system's mode - light", () => {
    setAppearance();
    expect(appearanceHelpers.setLightMode).toHaveBeenCalledTimes(1);
  });

  it("should use the system's mode - dark", () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockReturnValue({
        matches: true,
      }),
    });
    setAppearance();
    expect(appearanceHelpers.setDarkMode).toHaveBeenCalledTimes(1);
  });
});
