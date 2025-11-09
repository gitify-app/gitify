export async function raiseSoundNotification(volume: number) {
  const path = await globalThis.gitify.notificationSoundPath();

  const audio = new Audio(path);
  audio.volume = volume;
  audio.play();
}
