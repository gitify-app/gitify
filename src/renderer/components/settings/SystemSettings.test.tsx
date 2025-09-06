import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockAuth, mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import { SystemSettings } from './SystemSettings';

describe('renderer/components/settings/SystemSettings.tsx', () => {
  const updateSetting = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should change the open links radio group', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <SystemSettings />
        </AppContext.Provider>,
      );
    });

    await userEvent.click(screen.getByTestId('radio-openLinks-background'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('openLinks', 'BACKGROUND');
  });

  it('should toggle the keyboardShortcut checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <SystemSettings />
        </AppContext.Provider>,
      );
    });

    await userEvent.click(screen.getByTestId('checkbox-keyboardShortcut'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('keyboardShortcut', false);
  });

  it('should toggle the showNotificationsCountInTray checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <SystemSettings />
        </AppContext.Provider>,
      );
    });

    await userEvent.click(
      screen.getByTestId('checkbox-showNotificationsCountInTray'),
    );

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith(
      'showNotificationsCountInTray',
      false,
    );
  });

  it('should toggle the showNotifications checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <SystemSettings />
        </AppContext.Provider>,
      );
    });

    await userEvent.click(screen.getByTestId('checkbox-showNotifications'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('showNotifications', false);
  });

  describe('playSound', () => {
    it('should toggle the playSound checkbox', async () => {
      const { rerender } = render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <SystemSettings />
        </AppContext.Provider>,
      );

      await userEvent.click(screen.getByTestId('checkbox-playSound'));

      expect(updateSetting).toHaveBeenCalledTimes(1);
      expect(updateSetting).toHaveBeenCalledWith('playSound', false);

      // Simulate update to context with playSound = false
      rerender(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: { ...mockSettings, playSound: false },
            updateSetting,
          }}
        >
          <SystemSettings />
        </AppContext.Provider>,
      );

      expect(screen.getByTestId('settings-volume-group')).not.toBeVisible();
    });

    it('should increase notification volume', async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <SystemSettings />
        </AppContext.Provider>,
      );

      await userEvent.click(screen.getByTestId('settings-volume-up'));

      expect(updateSetting).toHaveBeenCalledTimes(1);
      expect(updateSetting).toHaveBeenCalledWith('notificationVolume', 30);
    });

    it('should decrease notification volume', async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <SystemSettings />
        </AppContext.Provider>,
      );

      await userEvent.click(screen.getByTestId('settings-volume-down'));

      expect(updateSetting).toHaveBeenCalledTimes(1);
      expect(updateSetting).toHaveBeenCalledWith('notificationVolume', 10);
    });

    it('should reset notification volume', async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: {
              ...mockSettings,
              notificationVolume: 30,
            },
            updateSetting,
          }}
        >
          <SystemSettings />
        </AppContext.Provider>,
      );

      await userEvent.click(screen.getByTestId('settings-volume-reset'));

      expect(updateSetting).toHaveBeenCalledTimes(1);
      expect(updateSetting).toHaveBeenCalledWith('notificationVolume', 20);
    });
  });

  it('should toggle the useAlternateIdleIcon checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <SystemSettings />
        </AppContext.Provider>,
      );
    });

    await userEvent.click(screen.getByTestId('checkbox-useAlternateIdleIcon'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('useAlternateIdleIcon', true);
  });

  it('should toggle the openAtStartup checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <SystemSettings />
        </AppContext.Provider>,
      );
    });

    await userEvent.click(screen.getByTestId('checkbox-openAtStartup'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('openAtStartup', true);
  });
});
