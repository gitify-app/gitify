export const raiseSoundNotification = async (volume: number) => {
  const path = await window.gitify.notificationSoundPath();

  const audio = new Audio(path);
  audio.volume = volume;
  audio.play();
};
