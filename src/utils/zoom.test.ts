import { percentageToZoom, zoomToPercentage } from './zoom';

describe('utils/zoom.ts', () => {
  it('should convert percentage to zoom level', () => {
    expect(percentageToZoom(100)).toBe(0);
    expect(percentageToZoom(50)).toBe(-0.925);
    expect(percentageToZoom(0)).toBe(-1.85);
    expect(percentageToZoom(150)).toBe(0.925);
  });

  it('should convert zoom level to percentage', () => {
    expect(zoomToPercentage(0)).toBe(100);
    expect(zoomToPercentage(-1)).toBe(46);
    expect(zoomToPercentage(-2)).toBe(-8);
    expect(zoomToPercentage(1)).toBe(154);
  });
});
