import type { Percentage } from '../../types';

const MINIMUM_VOLUME_PERCENTAGE = 0 as Percentage;
const MAXIMUM_VOLUME_PERCENTAGE = 100 as Percentage;
const VOLUME_STEP = 10 as Percentage;

/**
 * Play the user's configured notification sound at the given volume.
 *
 * Resolves the notification sound file path from the main process, then
 * plays it via the Web Audio API.
 *
 * @param volume - The playback volume as a percentage (0–100).
 */
export async function raiseSoundNotification(volume: Percentage) {
  const path = await window.gitify.notificationSoundPath();

  const audio = new Audio(path);
  audio.volume = volumePercentageToLevel(volume);
  audio.play();
}

/**
 * Convert volume percentage (0-100) to level (0.0-1.0)
 */
export function volumePercentageToLevel(percentage: Percentage): number {
  return percentage / 100;
}

/**
 * Returns true if can decrease volume percentage further
 */
export function canDecreaseVolume(volumePercentage: Percentage) {
  return volumePercentage - VOLUME_STEP >= MINIMUM_VOLUME_PERCENTAGE;
}

/**
 * Returns true if can increase volume percentage further
 */
export function canIncreaseVolume(volumePercentage: Percentage) {
  return volumePercentage + VOLUME_STEP <= MAXIMUM_VOLUME_PERCENTAGE;
}

/**
 * Decrease the volume by one step, clamped to the minimum.
 *
 * @param volume - The current volume percentage.
 * @returns The new volume percentage after decrement, or the minimum if already at the floor.
 */
export function decreaseVolume(volume: Percentage) {
  if (canDecreaseVolume(volume)) {
    return volume - VOLUME_STEP;
  }

  return MINIMUM_VOLUME_PERCENTAGE;
}

/**
 * Increase the volume by one step, clamped to the maximum.
 *
 * @param volume - The current volume percentage.
 * @returns The new volume percentage after increment, or the maximum if already at the ceiling.
 */
export function increaseVolume(volume: Percentage) {
  if (canIncreaseVolume(volume)) {
    return volume + VOLUME_STEP;
  }

  return MAXIMUM_VOLUME_PERCENTAGE;
}
