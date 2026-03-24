import type { Percentage } from '../../types';

const MINIMUM_VOLUME_PERCENTAGE = 0 as Percentage;
const MAXIMUM_VOLUME_PERCENTAGE = 100 as Percentage;
const VOLUME_STEP = 10 as Percentage;

/**
 * Convert volume percentage (0-100) to level (0.0-1.0).
 *
 * @param percentage - Volume percentage in the range `0`–`100`.
 * @returns Volume level in the range `0.0`–`1.0`.
 */
export function volumePercentageToLevel(percentage: Percentage): number {
  return percentage / 100;
}

/**
 * Returns `true` if the volume can be decreased by one step.
 *
 * @param volumePercentage - Current volume percentage.
 * @returns `true` if decreasing by one step would remain at or above the minimum, `false` otherwise.
 */
export function canDecreaseVolume(volumePercentage: Percentage) {
  return volumePercentage - VOLUME_STEP >= MINIMUM_VOLUME_PERCENTAGE;
}

/**
 * Returns `true` if the volume can be increased by one step.
 *
 * @param volumePercentage - Current volume percentage.
 * @returns `true` if increasing by one step would remain at or below the maximum, `false` otherwise.
 */
export function canIncreaseVolume(volumePercentage: Percentage) {
  return volumePercentage + VOLUME_STEP <= MAXIMUM_VOLUME_PERCENTAGE;
}

/**
 * Decreases the volume by one step, clamping to the minimum.
 *
 * @param volume - Current volume percentage.
 * @returns The new volume percentage after decreasing, or `0` if already at minimum.
 */
export function decreaseVolume(volume: Percentage): Percentage {
  if (canDecreaseVolume(volume)) {
    return (volume - VOLUME_STEP) as Percentage;
  }

  return MINIMUM_VOLUME_PERCENTAGE;
}

/**
 * Increases the volume by one step, clamping to the maximum.
 *
 * @param volume - Current volume percentage.
 * @returns The new volume percentage after increasing, or `100` if already at maximum.
 */
export function increaseVolume(volume: Percentage): Percentage {
  if (canIncreaseVolume(volume)) {
    return (volume + VOLUME_STEP) as Percentage;
  }

  return MAXIMUM_VOLUME_PERCENTAGE;
}
