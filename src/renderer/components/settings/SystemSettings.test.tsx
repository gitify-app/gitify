import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockAuth, mockSettings } from '../../__mocks__/state-mocks';
import type { Percentage } from '../../types';
import { SystemSettings } from './SystemSettings';

describe('renderer/components/settings/SystemSettings.tsx', () => {
  const mockUpdateSetting = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should change the open links radio group', async () => {
    await act(async () => {
      renderWithAppContext(<SystemSettings />, {
        auth: mockAuth,
        settings: mockSettings,
        updateSetting: mockUpdateSetting,
      });
    });

    await userEvent.click(screen.getByTestId('radio-openLinks-background'));

    expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
    expect(mockUpdateSetting).toHaveBeenCalledWith('openLinks', 'BACKGROUND');
  });

  it('should toggle the keyboardShortcut checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<SystemSettings />, {
        auth: mockAuth,
        settings: mockSettings,
        updateSetting: mockUpdateSetting,
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-keyboardShortcut'));

    expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
    expect(mockUpdateSetting).toHaveBeenCalledWith('keyboardShortcut', false);
  });

  it('should toggle the showNotifications checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<SystemSettings />, {
        auth: mockAuth,
        settings: mockSettings,
        updateSetting: mockUpdateSetting,
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-showNotifications'));

    expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
    expect(mockUpdateSetting).toHaveBeenCalledWith('showNotifications', false);
  });

  describe('playSound', () => {
    it('should toggle the playSound checkbox', async () => {
      renderWithAppContext(<SystemSettings />, {
        auth: mockAuth,
        settings: mockSettings,
        updateSetting: mockUpdateSetting,
      });

      await userEvent.click(screen.getByTestId('checkbox-playSound'));

      expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
      expect(mockUpdateSetting).toHaveBeenCalledWith('playSound', false);

      // Simulate update to context with playSound = false
      // rerender(
      //   <AppContextProvider
      //     value={{
      //       auth: mockAuth,
      //       settings: { ...mockSettings, playSound: false },
      //       updateSetting,
      //     }}
      //   >
      //     <SystemSettings />
      //   </AppContextProvider>,
      // );

      expect(screen.getByTestId('settings-volume-group')).not.toBeVisible();
    });

    it('should increase notification volume', async () => {
      renderWithAppContext(<SystemSettings />, {
        auth: mockAuth,
        settings: mockSettings,
        updateSetting: mockUpdateSetting,
      });

      await userEvent.click(screen.getByTestId('settings-volume-up'));

      expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
      expect(mockUpdateSetting).toHaveBeenCalledWith('notificationVolume', 30);
    });

    it('should decrease notification volume', async () => {
      renderWithAppContext(<SystemSettings />, {
        auth: mockAuth,
        settings: mockSettings,
        updateSetting: mockUpdateSetting,
      });

      await userEvent.click(screen.getByTestId('settings-volume-down'));

      expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
      expect(mockUpdateSetting).toHaveBeenCalledWith('notificationVolume', 10);
    });

    it('should reset notification volume', async () => {
      renderWithAppContext(<SystemSettings />, {
        auth: mockAuth,
        settings: { ...mockSettings, notificationVolume: 30 as Percentage },
        updateSetting: mockUpdateSetting,
      });

      await userEvent.click(screen.getByTestId('settings-volume-reset'));

      expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
      expect(mockUpdateSetting).toHaveBeenCalledWith('notificationVolume', 20);
    });
  });

  it('should toggle the openAtStartup checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<SystemSettings />, {
        auth: mockAuth,
        settings: mockSettings,
        updateSetting: mockUpdateSetting,
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-openAtStartup'));

    expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
    expect(mockUpdateSetting).toHaveBeenCalledWith('openAtStartup', true);
  });
});
