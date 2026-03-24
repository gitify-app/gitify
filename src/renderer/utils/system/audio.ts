import type { Percentage } from '../../types';

import { rendererLogError } from '../core/logger';
import { volumePercentageToLevel } from '../ui/volume';

// Cache audio instance to avoid re-creating elements on every notification.
let cachedAudio: HTMLAudioElement | null = null;

/**
 * Plays the notification sound at the specified volume.
 * The audio element is lazily created and cached to avoid re-creating it on every call.
 * The cache is cleared if playback fails so the next call can retry.
 *
 * @param volume - The volume level to play the sound at, as a percentage (`0`–`100`).
 */
export async function raiseSoundNotification(volume: Percentage) {
  if (!cachedAudio) {
    const path = await window.gitify.notificationSoundPath();

    cachedAudio = new Audio(path);
  }

  const audio = cachedAudio;

  audio.volume = volumePercentageToLevel(volume);

  try {
    await audio.play();
  } catch (err) {
    rendererLogError('audio', 'Failed to play notification sound:', err);
    cachedAudio = null;
  }
}
