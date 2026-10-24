import { act, screen } from '@testing-library/react';
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

  it.each([
    ['checkbox-showNotifications', 'showNotifications'],
    ['checkbox-playSound', 'playSound'],
    ['checkbox-showUpdateNotifications', 'showUpdateNotifications'],
  ] as const)('should toggle %s checkbox', async (testId, setting) => {
    await act(async () => {
      renderWithProviders(<AlertSettings />);
    });

    await userEvent.click(screen.getByTestId(testId));

    expect(toggleSettingSpy).toHaveBeenCalledTimes(1);
    expect(toggleSettingSpy).toHaveBeenCalledWith(setting);
  });

  describe('playSound', () => {
    it('volume controls should not be shown if playSound checkbox is false', async () => {
      renderWithProviders(<AlertSettings />, {
        settings: { ...mockSettings, playSound: false },
      });

      expect(screen.queryByTestId('settings-volume-group')).not.toBeInTheDocument();
    });

    it('volume controls should be shown if playSound checkbox is true', async () => {
      renderWithProviders(<AlertSettings />, {
        settings: { ...mockSettings, playSound: true },
      });

      expect(screen.getByTestId('settings-volume-group')).toBeInTheDocument();
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
