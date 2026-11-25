import type { Percentage } from '../../types';

import {
  canDecreaseZoom,
  canIncreaseZoom,
  clampZoomPercentage,
  decreaseZoom,
  getNextZoomPercentage,
  increaseZoom,
  resetZoomLevel,
  zoomLevelToPercentage,
  zoomPercentageToLevel,
} from './zoom';

describe('renderer/utils/zoom.ts', () => {
  window.gitify.zoom.setLevel = vi.fn();

  it('converts percentage to zoom level', () => {
    expect(zoomPercentageToLevel(100 as Percentage)).toBe(0);
    expect(zoomPercentageToLevel(50 as Percentage)).toBe(-1);
    expect(zoomPercentageToLevel(0 as Percentage)).toBe(-2);
    expect(zoomPercentageToLevel(150 as Percentage)).toBe(1);

    expect(zoomPercentageToLevel(undefined as unknown as Percentage)).toBe(0);
  });

  it('converts zoom level to percentage', () => {
    expect(zoomLevelToPercentage(0)).toBe(100);
    expect(zoomLevelToPercentage(-1)).toBe(50);
    expect(zoomLevelToPercentage(-2)).toBe(0);
    expect(zoomLevelToPercentage(1)).toBe(150);

    expect(zoomLevelToPercentage(undefined as unknown as number)).toBe(100);
  });

  it('clamps zoom percentages to the supported range', () => {
    expect(clampZoomPercentage(-10 as Percentage)).toBe(0);
    expect(clampZoomPercentage(50 as Percentage)).toBe(50);
    expect(clampZoomPercentage(150 as Percentage)).toBe(120);
  });

  it('computes the next zoom percentage for shortcut actions', () => {
    expect(getNextZoomPercentage(100 as Percentage, 'in')).toBe(110);
    expect(getNextZoomPercentage(100 as Percentage, 'out')).toBe(90);
    expect(getNextZoomPercentage(100 as Percentage, 'reset')).toBe(100);

    expect(getNextZoomPercentage(120 as Percentage, 'in')).toBe(120);
    expect(getNextZoomPercentage(0 as Percentage, 'out')).toBe(0);
    expect(getNextZoomPercentage(150 as Percentage, 'in')).toBe(120);
    expect(getNextZoomPercentage(-10 as Percentage, 'out')).toBe(0);
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

  describe('decrease zoom', () => {
    it('can decrease zoom within allowed range', () => {
      decreaseZoom(100 as Percentage);

      expect(window.gitify.zoom.setLevel).toHaveBeenCalledWith(-0.2);
    });

    it('cannot decrease zoom outside of allowed range', () => {
      decreaseZoom(0 as Percentage);

      expect(window.gitify.zoom.setLevel).not.toHaveBeenCalled();
    });
  });

  describe('increase zoom', () => {
    it('can increase zoom within allowed range', () => {
      increaseZoom(100 as Percentage);

      expect(window.gitify.zoom.setLevel).toHaveBeenCalledWith(0.2);
    });

    it('cannot increase zoom outside of allowed range', () => {
      increaseZoom(120 as Percentage);

      expect(window.gitify.zoom.setLevel).not.toHaveBeenCalled();
    });
  });

  it('can reset zoom level', () => {
    resetZoomLevel();

    expect(window.gitify.zoom.setLevel).toHaveBeenCalledWith(0);
  });
});
