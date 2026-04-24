import type { Percentage } from '../../types';

import { raiseSoundNotification } from './audio';

describe('renderer/utils/system/audio.ts', () => {
  describe('raiseSoundNotification', () => {
    it('should play the default sound at correct volume when no id is provided', async () => {
      const audioPlaySpy = vi.spyOn(Audio.prototype, 'play');

      await raiseSoundNotification(50 as Percentage);

      expect(window.gitify.notificationSoundPathById).toHaveBeenCalledWith(
        'tuturu',
      );
      expect(audioPlaySpy).toHaveBeenCalled();
    });

    it('should resolve a path for the requested sound id', async () => {
      const audioPlaySpy = vi.spyOn(Audio.prototype, 'play');

      await raiseSoundNotification(25 as Percentage, 'ping');

      expect(window.gitify.notificationSoundPathById).toHaveBeenCalledWith(
        'ping',
      );
      expect(audioPlaySpy).toHaveBeenCalled();
    });

    it("should be a no-op when soundId is 'none'", async () => {
      const audioPlaySpy = vi.spyOn(Audio.prototype, 'play');

      await raiseSoundNotification(80 as Percentage, 'none');

      expect(window.gitify.notificationSoundPathById).not.toHaveBeenCalled();
      expect(audioPlaySpy).not.toHaveBeenCalled();
    });

    it('should reuse a cached audio instance per sound id', async () => {
      vi.spyOn(Audio.prototype, 'play').mockResolvedValue(undefined);

      await raiseSoundNotification(50 as Percentage, 'bell');
      await raiseSoundNotification(50 as Percentage, 'bell');

      // Path resolution only happens on the first call for that id.
      expect(window.gitify.notificationSoundPathById).toHaveBeenCalledTimes(1);
    });
  });
});
