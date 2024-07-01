import { percentageToZoom, zoomToPercentage } from './zoom';

describe('utils/zoom.ts', () => {
  it('should convert percentage to zoom level', () => {
    expect(percentageToZoom(100)).toBe(0);
    expect(percentageToZoom(50)).toBe(-1);
    expect(percentageToZoom(0)).toBe(-2);
    expect(percentageToZoom(150)).toBe(1);
  });

  it('should convert zoom level to percentage', () => {
    expect(zoomToPercentage(0)).toBe(100);
    expect(zoomToPercentage(-1)).toBe(50);
    expect(zoomToPercentage(-2)).toBe(0);
    expect(zoomToPercentage(1)).toBe(150);
  });
});
