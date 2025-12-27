import { defaultSettings } from '../context/defaults';
import type { Percentage } from '../types';
import { isTauriEnvironment } from './environment';

const MINIMUM_ZOOM_PERCENTAGE = 0 as Percentage;
const MAXIMUM_ZOOM_PERCENTAGE = 120 as Percentage;
const RECOMMENDED_ZOOM_PERCENTAGE = defaultSettings.zoomPercentage;
const MULTIPLIER = 2;
const ZOOM_STEP = 10 as Percentage;

/**
 * Browser fallback for zoom using CSS zoom and localStorage
 */
const browserZoom = {
  getLevel: (): number => {
    if (typeof window === 'undefined') {
      return 0;
    }
    const zoomLevel = localStorage.getItem('zoomLevel');
    return zoomLevel ? Number.parseFloat(zoomLevel) : 0;
  },
  setLevel: (zoomLevel: number) => {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem('zoomLevel', zoomLevel.toString());
    const zoomFactor = 1.2 ** zoomLevel;
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.style.zoom = zoomFactor.toString();
    }
  },
};

/**
 * Get zoom API - uses Tauri if available, otherwise browser fallback
 */
function getZoomApi() {
  return isTauriEnvironment() ? window.gitify.zoom : browserZoom;
}

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
    getZoomApi().setLevel(
      zoomPercentageToLevel((zoomPercentage - ZOOM_STEP) as Percentage),
    );
  }
}

/**
 * Increase zoom by step amount
 */
export function increaseZoom(zoomPercentage: Percentage) {
  if (canIncreaseZoom(zoomPercentage)) {
    getZoomApi().setLevel(
      zoomPercentageToLevel((zoomPercentage + ZOOM_STEP) as Percentage),
    );
  }
}

/**
 * Reset zoom level
 */
export function resetZoomLevel() {
  getZoomApi().setLevel(zoomPercentageToLevel(RECOMMENDED_ZOOM_PERCENTAGE));
}

/**
 * Get current zoom level (browser-compatible)
 */
export function getCurrentZoomLevel(): number {
  return getZoomApi().getLevel();
}
