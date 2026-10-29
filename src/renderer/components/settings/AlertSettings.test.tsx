import { screen, waitFor } from '@testing-library/react';
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

  it('should describe the style options as individual or summary', () => {
    renderWithProviders(<AlertSettings />);

    expect(screen.getByText('Individual')).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.queryByText('Grouped')).not.toBeInTheDocument();
  });

  it('should change the native notification style', async () => {
    renderWithProviders(<AlertSettings />);

    await userEvent.click(screen.getByTestId('choice-nativeNotificationStyle-summary'));

    expect(updateSettingSpy).toHaveBeenCalledWith('nativeNotificationStyle', 'summary');
  });

  it('should change the native notification click behavior', async () => {
    renderWithProviders(<AlertSettings />);

    await userEvent.click(screen.getByTestId('choice-nativeNotificationClickAction-app'));

    expect(updateSettingSpy).toHaveBeenCalledWith('nativeNotificationClickAction', 'app');
  });

  it('should explain when native notifications are unsupported', async () => {
    vi.mocked(window.gitify.nativeNotifications.isSupported).mockResolvedValueOnce(false);

    renderWithProviders(<AlertSettings />);

    await waitFor(() =>
      expect(screen.getByTestId('native-notifications-unsupported')).toBeInTheDocument(),
    );
  });

  it.each([
    ['Show desktop notifications', 'showNotifications'],
    ['Show notification actions', 'nativeNotificationActions'],
    ['Play notification sound', 'playSound'],
    ['Show app update notifications', 'showUpdateNotifications'],
  ] as const)('toggles %s switch', async (label, setting) => {
    renderWithProviders(<AlertSettings />);

    await userEvent.click(screen.getByRole('button', { name: label }));

    expect(toggleSettingSpy).toHaveBeenCalledTimes(1);
    expect(toggleSettingSpy).toHaveBeenCalledWith(setting);
  });

  describe('Keep notifications on screen', () => {
    it('is hidden on macOS, where the system controls how long notifications stay', () => {
      vi.mocked(window.gitify.platform.isMacOS).mockReturnValue(true);

      renderWithProviders(<AlertSettings />);

      expect(
        screen.queryByRole('button', { name: 'Keep notifications on screen' }),
      ).not.toBeInTheDocument();
    });

    it('toggles on Windows and Linux', async () => {
      vi.mocked(window.gitify.platform.isMacOS).mockReturnValue(false);

      renderWithProviders(<AlertSettings />);
      await userEvent.click(screen.getByRole('button', { name: 'Keep notifications on screen' }));

      expect(toggleSettingSpy).toHaveBeenCalledWith('nativeNotificationKeepVisible');
    });
  });

  it('shows detailed help in tooltips', async () => {
    renderWithProviders(<AlertSettings />);

    await userEvent.click(screen.getByRole('button', { name: 'Help: Play notification sound' }));

    expect(
      screen.getByText(
        'Play a sound when new unread notifications arrive after filtering. Use the adjacent volume controls to adjust the sound level.',
      ),
    ).toBeInTheDocument();
  });

  it('shows notification volume and its tooltip when sound is enabled', async () => {
    renderWithProviders(<AlertSettings />);

    expect(screen.getByText('Notification volume')).toBeInTheDocument();
    expect(screen.getByTestId('reveal-volume')).toHaveAttribute('data-state', 'open');

    await userEvent.click(screen.getByRole('button', { name: 'Help: Notification volume' }));

    expect(screen.getByText('Adjust the volume of the notification sound.')).toBeInTheDocument();
  });

  it('hides volume controls when playSound is false', () => {
    renderWithProviders(<AlertSettings />, {
      settings: { ...mockSettings, playSound: false },
    });

    expect(screen.getByTestId('reveal-volume')).toHaveAttribute('data-state', 'closed');
  });

  it('increases notification volume', async () => {
    renderWithProviders(<AlertSettings />);

    await userEvent.click(screen.getByRole('button', { name: 'Volume up' }));

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith('notificationVolume', 30);
  });

  it('decreases notification volume', async () => {
    renderWithProviders(<AlertSettings />);

    await userEvent.click(screen.getByRole('button', { name: 'Volume down' }));

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith('notificationVolume', 10);
  });

  it('resets notification volume', async () => {
    renderWithProviders(<AlertSettings />, {
      settings: { ...mockSettings, notificationVolume: 30 as Percentage },
    });

    await userEvent.click(screen.getByRole('button', { name: 'Reset volume' }));

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith('notificationVolume', 20);
  });
});
