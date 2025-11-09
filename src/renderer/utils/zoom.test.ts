import type { Percentage } from '../types';
import {
  canDecreaseZoom,
  canIncreaseZoom,
  zoomLevelToPercentage,
  zoomPercentageToLevel,
} from './zoom';

describe('renderer/utils/zoom.ts', () => {
  it('should convert percentage to zoom level', () => {
    expect(zoomPercentageToLevel(100 as Percentage)).toBe(0);
    expect(zoomPercentageToLevel(50 as Percentage)).toBe(-1);
    expect(zoomPercentageToLevel(0 as Percentage)).toBe(-2);
    expect(zoomPercentageToLevel(150 as Percentage)).toBe(1);

    expect(zoomPercentageToLevel(undefined as unknown as Percentage)).toBe(0);
  });

  it('should convert zoom level to percentage', () => {
    expect(zoomLevelToPercentage(0)).toBe(100);
    expect(zoomLevelToPercentage(-1)).toBe(50);
    expect(zoomLevelToPercentage(-2)).toBe(0);
    expect(zoomLevelToPercentage(1)).toBe(150);

    expect(zoomLevelToPercentage(undefined)).toBe(100);
  });

  it('can decrease zoom percentage', () => {
    expect(canDecreaseZoom(-10 as Percentage)).toBe(false);
    expect(canDecreaseZoom(0 as Percentage)).toBe(false);
    expect(canDecreaseZoom(10 as Percentage)).toBe(true);
  });

  it('can increase zoom percentage', () => {
    expect(canIncreaseZoom(10 as Percentage)).toBe(true);
    expect(canIncreaseZoom(110 as Percentage)).toBe(true);
    expect(canIncreaseZoom(120 as Percentage)).toBe(false);
    expect(canIncreaseZoom(150 as Percentage)).toBe(false);
  });
});
