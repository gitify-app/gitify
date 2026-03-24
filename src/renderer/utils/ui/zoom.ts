import { defaultSettings } from '../../context/defaults';

import type { Percentage } from '../../types';

const MINIMUM_ZOOM_PERCENTAGE = 0 as Percentage;
const MAXIMUM_ZOOM_PERCENTAGE = 120 as Percentage;
const RECOMMENDED_ZOOM_PERCENTAGE = defaultSettings.zoomPercentage;
const MULTIPLIER = 2;
const ZOOM_STEP = 10 as Percentage;

/**
 * Zoom percentage to level. 100% is the recommended zoom level (0).
 * If somehow the percentage is not set, it will return 0, the default zoom level.
 *
 * @param percentage - Zoom percentage (0–150).
 * @returns Electron zoom level (-2 to 0.5).
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
 *
 * @param zoom - Electron zoom level (-2 to 0.5).
 * @returns Zoom percentage (0–150).
 */
export function zoomLevelToPercentage(zoom: number): Percentage {
  if (zoom === undefined) {
    return RECOMMENDED_ZOOM_PERCENTAGE;
  }

  return ((zoom / MULTIPLIER) * 100 +
    RECOMMENDED_ZOOM_PERCENTAGE) as Percentage;
}

/**
 * Returns `true` if the zoom can be decreased by one step.
 *
 * @param zoomPercentage - The current zoom percentage.
 * @returns `true` if decreasing by one step would remain at or above the minimum, `false` otherwise.
 */
export function canDecreaseZoom(zoomPercentage: Percentage) {
  return zoomPercentage - ZOOM_STEP >= MINIMUM_ZOOM_PERCENTAGE;
}

/**
 * Returns `true` if the zoom can be increased by one step.
 *
 * @param zoomPercentage - The current zoom percentage.
 * @returns `true` if increasing by one step would remain at or below the maximum, `false` otherwise.
 */
export function canIncreaseZoom(zoomPercentage: Percentage) {
  return zoomPercentage + ZOOM_STEP <= MAXIMUM_ZOOM_PERCENTAGE;
}

/**
 * Decreases the zoom level by one step if possible, then applies it via the Electron zoom bridge.
 *
 * @param zoomPercentage - Current zoom percentage.
 */
export function decreaseZoom(zoomPercentage: Percentage) {
  if (canDecreaseZoom(zoomPercentage)) {
    window.gitify.zoom.setLevel(
      zoomPercentageToLevel((zoomPercentage - ZOOM_STEP) as Percentage),
    );
  }
}

/**
 * Increases the zoom level by one step if possible, then applies it via the Electron zoom bridge.
 *
 * @param zoomPercentage - Current zoom percentage.
 */
export function increaseZoom(zoomPercentage: Percentage) {
  if (canIncreaseZoom(zoomPercentage)) {
    window.gitify.zoom.setLevel(
      zoomPercentageToLevel((zoomPercentage + ZOOM_STEP) as Percentage),
    );
  }
}

/**
 * Resets the zoom level to the recommended default, then applies it via the Electron zoom bridge.
 */
export function resetZoomLevel() {
  window.gitify.zoom.setLevel(
    zoomPercentageToLevel(RECOMMENDED_ZOOM_PERCENTAGE),
  );
}
