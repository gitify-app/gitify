import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockSettings } from '../../__mocks__/state-mocks';

import type { Percentage } from '../../types';

import { SystemSettings } from './SystemSettings';

describe('renderer/components/settings/SystemSettings.tsx', () => {
  const updateSettingMock = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should change the open links radio group', async () => {
    await act(async () => {
      renderWithAppContext(<SystemSettings />, {
        updateSetting: updateSettingMock,
      });
    });

    await userEvent.click(screen.getByTestId('radio-openLinks-background'));

    expect(updateSettingMock).toHaveBeenCalledTimes(1);
    expect(updateSettingMock).toHaveBeenCalledWith('openLinks', 'BACKGROUND');
  });

  it('should toggle the keyboardShortcut checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<SystemSettings />, {
        updateSetting: updateSettingMock,
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-keyboardShortcut'));

    expect(updateSettingMock).toHaveBeenCalledTimes(1);
    expect(updateSettingMock).toHaveBeenCalledWith('keyboardShortcut', false);
  });

  it('should toggle the showNotifications checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<SystemSettings />, {
        updateSetting: updateSettingMock,
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-showNotifications'));

    expect(updateSettingMock).toHaveBeenCalledTimes(1);
    expect(updateSettingMock).toHaveBeenCalledWith('showNotifications', false);
  });

  describe('playSound', () => {
    it('should toggle the playSound checkbox', async () => {
      renderWithAppContext(<SystemSettings />, {
        updateSetting: updateSettingMock,
      });

      await userEvent.click(screen.getByTestId('checkbox-playSound'));

      expect(updateSettingMock).toHaveBeenCalledTimes(1);
      expect(updateSettingMock).toHaveBeenCalledWith('playSound', false);
    });

    it('volume controls should not be shown if playSound checkbox is false', async () => {
      renderWithAppContext(<SystemSettings />, {
        updateSetting: updateSettingMock,
        settings: { ...mockSettings, playSound: false },
      });

      expect(screen.getByTestId('settings-volume-group')).not.toBeVisible();
    });

    it('volume controls should be shown if playSound checkbox is true', async () => {
      renderWithAppContext(<SystemSettings />, {
        updateSetting: updateSettingMock,
        settings: { ...mockSettings, playSound: true },
      });

      expect(screen.getByTestId('settings-volume-group')).toBeVisible();
    });

    it('should increase notification volume', async () => {
      renderWithAppContext(<SystemSettings />, {
        updateSetting: updateSettingMock,
      });

      await userEvent.click(screen.getByTestId('settings-volume-up'));

      expect(updateSettingMock).toHaveBeenCalledTimes(1);
      expect(updateSettingMock).toHaveBeenCalledWith('notificationVolume', 30);
    });

    it('should decrease notification volume', async () => {
      renderWithAppContext(<SystemSettings />, {
        updateSetting: updateSettingMock,
      });

      await userEvent.click(screen.getByTestId('settings-volume-down'));

      expect(updateSettingMock).toHaveBeenCalledTimes(1);
      expect(updateSettingMock).toHaveBeenCalledWith('notificationVolume', 10);
    });

    it('should reset notification volume', async () => {
      renderWithAppContext(<SystemSettings />, {
        settings: { ...mockSettings, notificationVolume: 30 as Percentage },
        updateSetting: updateSettingMock,
      });

      await userEvent.click(screen.getByTestId('settings-volume-reset'));

      expect(updateSettingMock).toHaveBeenCalledTimes(1);
      expect(updateSettingMock).toHaveBeenCalledWith('notificationVolume', 20);
    });
  });

  it('should toggle the openAtStartup checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<SystemSettings />, {
        updateSetting: updateSettingMock,
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-openAtStartup'));

    expect(updateSettingMock).toHaveBeenCalledTimes(1);
    expect(updateSettingMock).toHaveBeenCalledWith('openAtStartup', true);
  });
});
