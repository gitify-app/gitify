import {
  DEFAULT_SOUND_ID,
  NO_SOUND,
  type SoundChoice,
  type SoundId,
} from '../../../shared/sounds';

import type { Percentage } from '../../types';

import { rendererLogError, toError } from '../core/logger';
import { volumePercentageToLevel } from '../ui/volume';

// Cache audio instances per sound id to avoid re-creating elements on every notification.
const audioCache = new Map<SoundId, HTMLAudioElement>();

async function getAudio(soundId: SoundId): Promise<HTMLAudioElement> {
  const cached = audioCache.get(soundId);
  if (cached) {
    return cached;
  }
  const path = await window.gitify.notificationSoundPathById(soundId);
  const audio = new Audio(path);
  audioCache.set(soundId, audio);
  return audio;
}

/**
 * Plays the bundled notification sound for `soundId` at the specified volume.
 * Audio elements are lazily created and cached per sound id. The cache entry
 * is cleared if playback fails so the next call can retry.
 *
 * Pass `'none'` to mute (no sound played).
 *
 * @param volume - The volume level to play the sound at, as a percentage (`0`–`100`).
 * @param soundId - The id of the sound to play, or `'none'` to mute.
 */
export async function raiseSoundNotification(
  volume: Percentage,
  soundId: SoundChoice = DEFAULT_SOUND_ID,
) {
  if (soundId === NO_SOUND) {
    return;
  }

  const audio = await getAudio(soundId);
  audio.volume = volumePercentageToLevel(volume);

  try {
    await audio.play();
  } catch (err) {
    rendererLogError(
      'audio',
      'Failed to play notification sound:',
      toError(err),
    );
    audioCache.delete(soundId);
  }
}
