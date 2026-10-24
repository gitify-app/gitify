import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';
import { mockSettings } from '../../__mocks__/state-mocks';

import { useSettingsStore } from '../../stores';

import type { Percentage } from '../../types';

import { AlertSettings } from './AlertSettings';

describe('renderer/components/settings/AlertSettings.tsx', () => {
  let toggleSettingSpy: ReturnType<typeof vi.spyOn>;
  let updateSettingSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    toggleSettingSpy = vi.spyOn(useSettingsStore.getState(), 'toggleSetting');
    updateSettingSpy = vi.spyOn(useSettingsStore.getState(), 'updateSetting');
  });

  it('should describe the style options as individual or summary', async () => {
    await act(async () => {
      renderWithProviders(<AlertSettings />);
    });

    expect(screen.getByText('Individual')).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.queryByText('Grouped')).not.toBeInTheDocument();
  });

  it('should change the native notification style', async () => {
    await act(async () => {
      renderWithProviders(<AlertSettings />);
    });

    await userEvent.click(screen.getByTestId('choice-nativeNotificationStyle-summary'));

    expect(updateSettingSpy).toHaveBeenCalledWith('nativeNotificationStyle', 'summary');
  });

  it('should change the native notification click behavior', async () => {
    await act(async () => {
      renderWithProviders(<AlertSettings />);
    });

    await userEvent.click(screen.getByTestId('choice-nativeNotificationClickAction-app'));

    expect(updateSettingSpy).toHaveBeenCalledWith('nativeNotificationClickAction', 'app');
  });

  it('should explain when native notifications are unsupported', async () => {
    vi.mocked(window.gitify.nativeNotifications.isSupported).mockResolvedValueOnce(false);

    await act(async () => {
      renderWithProviders(<AlertSettings />);
    });

    await waitFor(() =>
      expect(screen.getByTestId('native-notifications-unsupported')).toBeInTheDocument(),
    );
  });

  it.each([
    ['Show desktop notifications', 'showNotifications'],
    ['Show notification actions', 'nativeNotificationActions'],
    ['Keep notifications on screen', 'nativeNotificationKeepVisible'],
    ['Play notification sound', 'playSound'],
    ['Show app update notifications', 'showUpdateNotifications'],
  ] as const)('should toggle %s switch', async (label, setting) => {
    await act(async () => {
      renderWithProviders(<AlertSettings />);
    });

    await userEvent.click(screen.getByRole('button', { name: label }));

    expect(toggleSettingSpy).toHaveBeenCalledTimes(1);
    expect(toggleSettingSpy).toHaveBeenCalledWith(setting);
  });

  describe('playSound', () => {
    it('shows the sound details in a tooltip', async () => {
      renderWithProviders(<AlertSettings />);

      await userEvent.click(screen.getByRole('button', { name: 'tooltip-playSound' }));

      expect(
        screen.getByText(
          'Play a sound when new unread notifications arrive after filtering. Use the adjacent volume controls to adjust the sound level.',
        ),
      ).toBeInTheDocument();
    });

    it('shows the notification volume label and tooltip', async () => {
      renderWithProviders(<AlertSettings />);

      expect(screen.getByText('Notification volume')).toBeInTheDocument();

      await userEvent.click(screen.getByTestId('tooltip-icon-tooltip-notificationVolume'));

      expect(screen.getByText('Adjust the volume of the notification sound.')).toBeInTheDocument();
    });

    it('volume controls should not be shown if playSound checkbox is false', async () => {
      renderWithProviders(<AlertSettings />, {
        settings: { ...mockSettings, playSound: false },
      });

      expect(screen.getByTestId('reveal-volume')).toHaveAttribute('data-state', 'closed');
    });

    it('volume controls should be shown if playSound checkbox is true', async () => {
      renderWithProviders(<AlertSettings />, {
        settings: { ...mockSettings, playSound: true },
      });

      expect(screen.getByTestId('reveal-volume')).toHaveAttribute('data-state', 'open');
    });

    it('should increase notification volume', async () => {
      renderWithProviders(<AlertSettings />);

      await userEvent.click(screen.getByTestId('settings-volume-up'));

      expect(updateSettingSpy).toHaveBeenCalledTimes(1);
      expect(updateSettingSpy).toHaveBeenCalledWith('notificationVolume', 30);
    });

    it('should decrease notification volume', async () => {
      renderWithProviders(<AlertSettings />);

      await userEvent.click(screen.getByTestId('settings-volume-down'));

      expect(updateSettingSpy).toHaveBeenCalledTimes(1);
      expect(updateSettingSpy).toHaveBeenCalledWith('notificationVolume', 10);
    });

    it('should reset notification volume', async () => {
      renderWithProviders(<AlertSettings />, {
        settings: { ...mockSettings, notificationVolume: 30 as Percentage },
      });

      await userEvent.click(screen.getByTestId('settings-volume-reset'));

      expect(updateSettingSpy).toHaveBeenCalledTimes(1);
      expect(updateSettingSpy).toHaveBeenCalledWith('notificationVolume', 20);
    });
  });
});
