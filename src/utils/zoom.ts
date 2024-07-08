const RECOMMENDED = 100;
const MULTIPLIER = 2;

/**
 * Zoom percentage to level. 100% is the recommended zoom level (0).
 * @param percentage 0-150
 * @returns zoomLevel -2 to 0.5
 */
export const zoomPercentageToLevel = (percentage: number): number => {
  return ((percentage - RECOMMENDED) * MULTIPLIER) / 100;
};

/**
 * Zoom level to percentage. 0 is the recommended zoom level (100%).
 * @param zoom -2 to 0.5
 * @returns percentage 0-150
 */
export const zoomLevelToPercentage = (zoom: number): number => {
  return (zoom / MULTIPLIER) * 100 + RECOMMENDED;
};
