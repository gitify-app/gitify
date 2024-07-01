const RECOMMENDED = 100;
const MULTIPLIER = 1.85;

/**
 * Percentage to zoom level. 100% is the recommended zoom level (0).
 * @param percentage 0-150
 * @returns zoomLevel -2 to 0.5
 */
export const percentageToZoom = (percentage: number): number => {
  return ((percentage - RECOMMENDED) * MULTIPLIER) / 100;
};

export const zoomToPercentage = (zoom: number): number => {
  return Math.round((zoom / MULTIPLIER) * 100 + RECOMMENDED);
};
