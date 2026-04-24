/**
 * Catalog of bundled notification sounds shared between main and renderer.
 * The `filename` is resolved relative to `assets/sounds/` at runtime.
 */
export type SoundId =
  | 'clearly'
  | 'chime'
  | 'ping'
  | 'bell'
  | 'glitch'
  | 'pop'
  | 'tuturu'
  | 'youre-the-last-one'
  | 'approved'
  | 'changes-requested'
  | 'engineer-no'
  | 'excellent-argument';

export interface SoundDefinition {
  id: SoundId;
  label: string;
  filename: string;
}

export const AVAILABLE_SOUNDS: readonly SoundDefinition[] = [
  { id: 'tuturu', label: 'Tuturu', filename: 'tuturu_1.mp3' },
  {
    id: 'youre-the-last-one',
    label: "You're the Last One",
    filename: 'youre-the-last-one.mp3',
  },
  { id: 'approved', label: 'Approved', filename: 'approved_T00cixo.mp3' },
  {
    id: 'changes-requested',
    label: 'Changes Requested',
    filename: 'lionfield-not-approved.mp3',
  },
  {
    id: 'excellent-argument',
    label: 'Excellent Argument',
    filename: 'excellent-argument-approved.mp3',
  },
  { id: 'engineer-no', label: 'Engineer No', filename: 'engineer_no01.mp3' },
  { id: 'clearly', label: 'Clearly', filename: 'clearly.mp3' },
  { id: 'chime', label: 'Chime', filename: 'chime.mp3' },
  { id: 'ping', label: 'Ping', filename: 'ping.mp3' },
  { id: 'bell', label: 'Bell', filename: 'bell.mp3' },
  { id: 'glitch', label: 'Glitch', filename: 'glitch.mp3' },
  { id: 'pop', label: 'Pop', filename: 'pop.mp3' },
] as const;

export const DEFAULT_SOUND_ID: SoundId = 'tuturu';

/**
 * Special id used in settings to mute the sound for a given reason.
 * Kept distinct from `SoundId` because `'none'` does not map to a file.
 */
export const NO_SOUND = 'none';
export type SoundChoice = SoundId | typeof NO_SOUND;

export function getSoundDefinition(id: SoundId): SoundDefinition {
  return (
    AVAILABLE_SOUNDS.find((s) => s.id === id) ??
    AVAILABLE_SOUNDS.find((s) => s.id === DEFAULT_SOUND_ID) ??
    AVAILABLE_SOUNDS[0]
  );
}
