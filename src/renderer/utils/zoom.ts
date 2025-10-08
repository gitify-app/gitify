const RECOMMENDED = 100;
const MULTIPLIER = 2;

/**
 * Zoom percentage to level. 100% is the recommended zoom level (0). If somehow the percentage is not set, it will return 0, the default zoom level.
 * @param percentage 0-150
 * @returns zoomLevel -2 to 0.5
 */
export const zoomPercentageToLevel = (percentage: number): number => {
  if (percentage === undefined) {
    return 0;
  }

  return ((percentage - RECOMMENDED) * MULTIPLIER) / 100;
};

/**
 * Zoom level to percentage. 0 is the recommended zoom level (100%). If somehow the zoom level is not set, it will return 100, the default zoom percentage.
 * @param zoom -2 to 0.5
 * @returns percentage 0-150
 */
export const zoomLevelToPercentage = (zoom: number): number => {
  if (zoom === undefined) {
    return 100;
  }

  return (zoom / MULTIPLIER) * 100 + RECOMMENDED;
};
