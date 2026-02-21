import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';

import { useSettingsStore } from '../../stores';

import type { Percentage } from '../../types';

import { SystemSettings } from './SystemSettings';

describe('renderer/components/settings/SystemSettings.tsx', () => {
  let updateSettingSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    updateSettingSpy = vi.spyOn(useSettingsStore.getState(), 'updateSetting');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should change the open links radio group', async () => {
    await act(async () => {
      renderWithAppContext(<SystemSettings />);
    });

    await userEvent.click(screen.getByTestId('radio-openLinks-background'));

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith('openLinks', 'BACKGROUND');
  });

  it('should toggle the keyboardShortcut checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<SystemSettings />);
    });

    await userEvent.click(screen.getByTestId('checkbox-keyboardShortcut'));

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith('keyboardShortcut', false);
  });

  it('should toggle the showNotifications checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<SystemSettings />);
    });

    await userEvent.click(screen.getByTestId('checkbox-showNotifications'));

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith('showNotifications', false);
  });

  describe('playSound', () => {
    it('should toggle the playSound checkbox', async () => {
      renderWithAppContext(<SystemSettings />);

      await userEvent.click(screen.getByTestId('checkbox-playSound'));

      expect(updateSettingSpy).toHaveBeenCalledTimes(1);
      expect(updateSettingSpy).toHaveBeenCalledWith('playSound', false);
    });

    it('volume controls should not be shown if playSound checkbox is false', async () => {
      useSettingsStore.setState({
        playSound: false,
      });

      renderWithAppContext(<SystemSettings />);

      expect(screen.getByTestId('settings-volume-group')).not.toBeVisible();
    });

    it('volume controls should be shown if playSound checkbox is true', async () => {
      useSettingsStore.setState({
        playSound: true,
      });

      renderWithAppContext(<SystemSettings />);

      expect(screen.getByTestId('settings-volume-group')).toBeVisible();
    });

    it('should increase notification volume', async () => {
      renderWithAppContext(<SystemSettings />);

      await userEvent.click(screen.getByTestId('settings-volume-up'));

      expect(updateSettingSpy).toHaveBeenCalledTimes(1);
      expect(updateSettingSpy).toHaveBeenCalledWith('notificationVolume', 30);
    });

    it('should decrease notification volume', async () => {
      renderWithAppContext(<SystemSettings />);

      await userEvent.click(screen.getByTestId('settings-volume-down'));

      expect(updateSettingSpy).toHaveBeenCalledTimes(1);
      expect(updateSettingSpy).toHaveBeenCalledWith('notificationVolume', 10);
    });

    it('should reset notification volume', async () => {
      useSettingsStore.setState({
        notificationVolume: 30 as Percentage,
      });

      renderWithAppContext(<SystemSettings />);

      await userEvent.click(screen.getByTestId('settings-volume-reset'));

      expect(updateSettingSpy).toHaveBeenCalledTimes(1);
      expect(updateSettingSpy).toHaveBeenCalledWith('notificationVolume', 20);
    });
  });

  it('should toggle the openAtStartup checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<SystemSettings />);
    });

    await userEvent.click(screen.getByTestId('checkbox-openAtStartup'));

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith('openAtStartup', true);
  });
});
