import { mockSettings } from '../__mocks__/state-mocks';

import type { SettingsState } from '../types';

import * as comms from './comms';
import { setTrayIconColorAndTitle } from './tray';

describe('renderer/utils/tray.ts', () => {
  const updateTrayColorSpy = jest.spyOn(comms, 'updateTrayColor');
  const updateTrayTitleSpy = jest.spyOn(comms, 'updateTrayTitle');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setTrayIconColorAndTitle', () => {
    it('should update tray color and title when showNotificationsCountInTray is true and has unread notifications', () => {
      const settings: SettingsState = {
        ...mockSettings,
        showNotificationsCountInTray: true,
      };

      setTrayIconColorAndTitle(5, settings);

      expect(updateTrayColorSpy).toHaveBeenCalledTimes(1);
      expect(updateTrayColorSpy).toHaveBeenCalledWith(5);
      expect(updateTrayTitleSpy).toHaveBeenCalledTimes(1);
      expect(updateTrayTitleSpy).toHaveBeenCalledWith('5');
    });

    it('should update tray color and empty title when showNotificationsCountInTray is false and has unread notifications', () => {
      const settings: SettingsState = {
        ...mockSettings,
        showNotificationsCountInTray: false,
      };

      setTrayIconColorAndTitle(5, settings);

      expect(updateTrayColorSpy).toHaveBeenCalledTimes(1);
      expect(updateTrayColorSpy).toHaveBeenCalledWith(5);
      expect(updateTrayTitleSpy).toHaveBeenCalledTimes(1);
      expect(updateTrayTitleSpy).toHaveBeenCalledWith('');
    });

    it('should update tray with empty title when no unread notifications', () => {
      const settings: SettingsState = {
        ...mockSettings,
        showNotificationsCountInTray: true,
      };

      setTrayIconColorAndTitle(0, settings);

      expect(updateTrayColorSpy).toHaveBeenCalledTimes(1);
      expect(updateTrayColorSpy).toHaveBeenCalledWith(0);
      expect(updateTrayTitleSpy).toHaveBeenCalledTimes(1);
      expect(updateTrayTitleSpy).toHaveBeenCalledWith('');
    });
  });
});
