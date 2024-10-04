import { zoomLevelToPercentage, zoomPercentageToLevel } from './zoom';

describe('renderer/utils/zoom.ts', () => {
  it('should convert percentage to zoom level', () => {
    expect(zoomPercentageToLevel(100)).toBe(0);
    expect(zoomPercentageToLevel(50)).toBe(-1);
    expect(zoomPercentageToLevel(0)).toBe(-2);
    expect(zoomPercentageToLevel(150)).toBe(1);

    expect(zoomPercentageToLevel(undefined)).toBe(0);
  });

  it('should convert zoom level to percentage', () => {
    expect(zoomLevelToPercentage(0)).toBe(100);
    expect(zoomLevelToPercentage(-1)).toBe(50);
    expect(zoomLevelToPercentage(-2)).toBe(0);
    expect(zoomLevelToPercentage(1)).toBe(150);

    expect(zoomLevelToPercentage(undefined)).toBe(100);
  });
});
