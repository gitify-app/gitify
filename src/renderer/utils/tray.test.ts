import { useSettingsStore } from '../stores';

import * as comms from './comms';
import { setTrayIconColorAndTitle } from './tray';

describe('renderer/utils/tray.ts', () => {
  const updateTrayColorSpy = vi.spyOn(comms, 'updateTrayColor');
  const updateTrayTitleSpy = vi.spyOn(comms, 'updateTrayTitle');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setTrayIconColorAndTitle', () => {
    it('should update tray color and title when showNotificationsCountInTray is true and has unread notifications', () => {
      useSettingsStore.setState({
        showNotificationsCountInTray: true,
      });

      setTrayIconColorAndTitle(5, true);

      expect(updateTrayColorSpy).toHaveBeenCalledTimes(1);
      expect(updateTrayColorSpy).toHaveBeenCalledWith(5);
      expect(updateTrayTitleSpy).toHaveBeenCalledTimes(1);
      expect(updateTrayTitleSpy).toHaveBeenCalledWith('5');
    });

    it('should update tray color and empty title when showNotificationsCountInTray is false and has unread notifications', () => {
      useSettingsStore.setState({
        showNotificationsCountInTray: false,
      });

      setTrayIconColorAndTitle(5, true);

      expect(updateTrayColorSpy).toHaveBeenCalledTimes(1);
      expect(updateTrayColorSpy).toHaveBeenCalledWith(5);
      expect(updateTrayTitleSpy).toHaveBeenCalledTimes(1);
      expect(updateTrayTitleSpy).toHaveBeenCalledWith('');
    });

    it('should update tray with empty title when no unread notifications', () => {
      useSettingsStore.setState({
        showNotificationsCountInTray: true,
      });

      setTrayIconColorAndTitle(0, true);

      expect(updateTrayColorSpy).toHaveBeenCalledTimes(1);
      expect(updateTrayColorSpy).toHaveBeenCalledWith(0);
      expect(updateTrayTitleSpy).toHaveBeenCalledTimes(1);
      expect(updateTrayTitleSpy).toHaveBeenCalledWith('');
    });

    it('should update tray color and empty title when offline and has notifications', () => {
      useSettingsStore.setState({
        showNotificationsCountInTray: false,
      });

      setTrayIconColorAndTitle(5, false);

      expect(updateTrayColorSpy).toHaveBeenCalledTimes(1);
      expect(updateTrayColorSpy).toHaveBeenCalledWith(5, false);
      expect(updateTrayTitleSpy).toHaveBeenCalledTimes(1);
      expect(updateTrayTitleSpy).toHaveBeenCalledWith('');
    });
  });
});
