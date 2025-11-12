import { defaultSettings } from '../context/defaults';
import type { Percentage } from '../types';

const MINIMUM_ZOOM_PERCENTAGE = 0 as Percentage;
const MAXIMUM_ZOOM_PERCENTAGE = 120 as Percentage;
const RECOMMENDED_ZOOM_PERCENTAGE = defaultSettings.zoomPercentage;
const MULTIPLIER = 2;
const ZOOM_STEP = 10 as Percentage;

/**
 * Zoom percentage to level. 100% is the recommended zoom level (0).
 * If somehow the percentage is not set, it will return 0, the default zoom level.
 * @param percentage 0-150
 * @returns zoomLevel -2 to 0.5
 */
export function zoomPercentageToLevel(percentage: Percentage): number {
  if (percentage === undefined) {
    return zoomPercentageToLevel(RECOMMENDED_ZOOM_PERCENTAGE);
  }

  return ((percentage - RECOMMENDED_ZOOM_PERCENTAGE) * MULTIPLIER) / 100;
}

/**
 * Zoom level to percentage. 0 is the recommended zoom level (100%).
 * If somehow the zoom level is not set, it will return 100, the default zoom percentage.
 * @param zoom -2 to 0.5
 * @returns percentage 0-150
 */
export function zoomLevelToPercentage(zoom: number): Percentage {
  if (zoom === undefined) {
    return RECOMMENDED_ZOOM_PERCENTAGE;
  }

  return ((zoom / MULTIPLIER) * 100 +
    RECOMMENDED_ZOOM_PERCENTAGE) as Percentage;
}

/**
 * Returns true if can decrease zoom percentage further
 */
export function canDecreaseZoom(zoomPercentage: Percentage) {
  return zoomPercentage - ZOOM_STEP >= MINIMUM_ZOOM_PERCENTAGE;
}

/**
 * Returns true if can increase zoom percentage further
 */
export function canIncreaseZoom(zoomPercentage: Percentage) {
  return zoomPercentage + ZOOM_STEP <= MAXIMUM_ZOOM_PERCENTAGE;
}

/**
 * Decrease zoom by step amount
 */
export function decreaseZoom(zoomPercentage: Percentage) {
  if (canDecreaseZoom(zoomPercentage)) {
    window.gitify.zoom.setLevel(
      zoomPercentageToLevel((zoomPercentage - ZOOM_STEP) as Percentage),
    );
  }
}

/**
 * Increase zoom by step amount
 */
export function increaseZoom(zoomPercentage: Percentage) {
  if (canIncreaseZoom(zoomPercentage)) {
    window.gitify.zoom.setLevel(
      zoomPercentageToLevel((zoomPercentage + ZOOM_STEP) as Percentage),
    );
  }
}
