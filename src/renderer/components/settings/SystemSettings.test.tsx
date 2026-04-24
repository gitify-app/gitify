import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';
import { mockSettings } from '../../__mocks__/state-mocks';

import { defaultSettings } from '../../context/defaults';

import type { KeyboardAcceleratorShortcut, Percentage } from '../../types';

import * as audio from '../../utils/system/audio';
import { SystemSettings } from './SystemSettings';

describe('renderer/components/settings/SystemSettings.tsx', () => {
  const updateSettingMock = vi.fn();

  it('should change the open links radio group', async () => {
    await act(async () => {
      renderWithProviders(<SystemSettings />, {
        updateSetting: updateSettingMock,
      });
    });

    await userEvent.click(screen.getByTestId('radio-openLinks-background'));

    expect(updateSettingMock).toHaveBeenCalledTimes(1);
    expect(updateSettingMock).toHaveBeenCalledWith('openLinks', 'BACKGROUND');
  });

  it('should toggle the keyboardShortcut checkbox', async () => {
    await act(async () => {
      renderWithProviders(<SystemSettings />, {
        updateSetting: updateSettingMock,
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-keyboardShortcut'));

    expect(updateSettingMock).toHaveBeenCalledTimes(1);
    expect(updateSettingMock).toHaveBeenCalledWith('keyboardShortcut', false);
  });

  it('should reset global shortcut to default when customized', async () => {
    renderWithProviders(<SystemSettings />, {
      updateSetting: updateSettingMock,
      settings: {
        ...mockSettings,
        openGitifyShortcut:
          'CommandOrControl+Shift+X' as KeyboardAcceleratorShortcut,
      },
    });

    await userEvent.click(screen.getByTestId('settings-shortcut-reset'));

    expect(updateSettingMock).toHaveBeenCalledWith(
      'openGitifyShortcut',
      defaultSettings.openGitifyShortcut,
    );
  });

  describe('recording global shortcut', () => {
    it('should enter recording mode and show "Press keys…" prompt', async () => {
      renderWithProviders(<SystemSettings />, {
        updateSetting: updateSettingMock,
        settings: { ...mockSettings, keyboardShortcut: true },
      });

      await userEvent.click(screen.getByTestId('settings-shortcut-edit'));

      expect(screen.getByText('Press keys…')).toBeInTheDocument();
    });

    it('should show live modifier keys as they are pressed', async () => {
      renderWithProviders(<SystemSettings />, {
        updateSetting: updateSettingMock,
        settings: { ...mockSettings, keyboardShortcut: true },
      });

      await userEvent.click(screen.getByTestId('settings-shortcut-edit'));

      // Press Meta (⌘) — isMacOS is mocked to true in test setup
      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            code: 'MetaLeft',
            key: 'Meta',
            metaKey: true,
            bubbles: true,
            cancelable: true,
          }),
        );
      });
      expect(screen.getByText('⌘…')).toBeInTheDocument();

      // Add Shift while Meta is still held
      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            code: 'ShiftLeft',
            key: 'Shift',
            metaKey: true,
            shiftKey: true,
            bubbles: true,
            cancelable: true,
          }),
        );
      });
      expect(screen.getByText('⌘·⇧…')).toBeInTheDocument();

      // Release Shift
      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keyup', {
            code: 'ShiftLeft',
            key: 'Shift',
            metaKey: true,
            shiftKey: false,
            bubbles: true,
          }),
        );
      });
      expect(screen.getByText('⌘…')).toBeInTheDocument();
    });

    it('should finalize shortcut when a non-modifier key is pressed', async () => {
      renderWithProviders(<SystemSettings />, {
        updateSetting: updateSettingMock,
        settings: { ...mockSettings, keyboardShortcut: true },
      });

      await userEvent.click(screen.getByTestId('settings-shortcut-edit'));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            code: 'KeyG',
            key: 'g',
            metaKey: true,
            shiftKey: true,
            bubbles: true,
            cancelable: true,
          }),
        );
      });

      expect(updateSettingMock).toHaveBeenCalledWith(
        'openGitifyShortcut',
        'CommandOrControl+Shift+G',
      );
      // Recording mode should exit
      expect(
        screen.queryByText('Click outside this area to cancel.'),
      ).not.toBeInTheDocument();
    });

    it('should cancel recording when clicking outside the shortcut area', async () => {
      renderWithProviders(<SystemSettings />, {
        updateSetting: updateSettingMock,
        settings: { ...mockSettings, keyboardShortcut: true },
      });

      await userEvent.click(screen.getByTestId('settings-shortcut-edit'));
      expect(screen.getByText('Press keys…')).toBeInTheDocument();

      // Click somewhere outside the shortcut row
      await userEvent.click(document.body);

      expect(
        screen.queryByText('Click outside this area to cancel.'),
      ).not.toBeInTheDocument();
    });
  });

  it('should toggle the showNotifications checkbox', async () => {
    await act(async () => {
      renderWithProviders(<SystemSettings />, {
        updateSetting: updateSettingMock,
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-showNotifications'));

    expect(updateSettingMock).toHaveBeenCalledTimes(1);
    expect(updateSettingMock).toHaveBeenCalledWith('showNotifications', false);
  });

  describe('playSound', () => {
    it('should toggle the playSound checkbox', async () => {
      renderWithProviders(<SystemSettings />, {
        updateSetting: updateSettingMock,
      });

      await userEvent.click(screen.getByTestId('checkbox-playSound'));

      expect(updateSettingMock).toHaveBeenCalledTimes(1);
      expect(updateSettingMock).toHaveBeenCalledWith('playSound', false);
    });

    it('volume controls should not be shown if playSound checkbox is false', async () => {
      renderWithProviders(<SystemSettings />, {
        updateSetting: updateSettingMock,
        settings: { ...mockSettings, playSound: false },
      });

      expect(screen.getByTestId('settings-volume-group')).not.toBeVisible();
    });

    it('volume controls should be shown if playSound checkbox is true', async () => {
      renderWithProviders(<SystemSettings />, {
        updateSetting: updateSettingMock,
        settings: { ...mockSettings, playSound: true },
      });

      expect(screen.getByTestId('settings-volume-group')).toBeVisible();
    });

    it('should increase notification volume', async () => {
      renderWithProviders(<SystemSettings />, {
        updateSetting: updateSettingMock,
      });

      await userEvent.click(screen.getByTestId('settings-volume-up'));

      expect(updateSettingMock).toHaveBeenCalledTimes(1);
      expect(updateSettingMock).toHaveBeenCalledWith('notificationVolume', 30);
    });

    it('should decrease notification volume', async () => {
      renderWithProviders(<SystemSettings />, {
        updateSetting: updateSettingMock,
      });

      await userEvent.click(screen.getByTestId('settings-volume-down'));

      expect(updateSettingMock).toHaveBeenCalledTimes(1);
      expect(updateSettingMock).toHaveBeenCalledWith('notificationVolume', 10);
    });

    it('should reset notification volume', async () => {
      renderWithProviders(<SystemSettings />, {
        settings: { ...mockSettings, notificationVolume: 30 as Percentage },
        updateSetting: updateSettingMock,
      });

      await userEvent.click(screen.getByTestId('settings-volume-reset'));

      expect(updateSettingMock).toHaveBeenCalledTimes(1);
      expect(updateSettingMock).toHaveBeenCalledWith('notificationVolume', 20);
    });
  });

  describe('per-reason sound overrides', () => {
    it('renders a row per reason with a preview button', async () => {
      renderWithProviders(<SystemSettings />, {
        updateSetting: updateSettingMock,
        settings: { ...mockSettings, playSound: true },
      });

      // Sanity-check a few rows exist.
      expect(screen.getByTestId('settings-sound-default')).toBeInTheDocument();
      expect(screen.getByTestId('settings-sound-mention')).toBeInTheDocument();
      expect(
        screen.getByTestId('settings-sound-review_requested'),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('settings-sound-ci_activity'),
      ).toBeInTheDocument();
    });

    it('does not render per-reason panel when playSound is off', async () => {
      renderWithProviders(<SystemSettings />, {
        updateSetting: updateSettingMock,
        settings: { ...mockSettings, playSound: false },
      });

      expect(
        screen.queryByTestId('settings-per-reason-sounds'),
      ).not.toBeInTheDocument();
    });

    it('changing a reason select writes the override via updateSetting', async () => {
      renderWithProviders(<SystemSettings />, {
        updateSetting: updateSettingMock,
        settings: { ...mockSettings, playSound: true, reasonSounds: {} },
      });

      await userEvent.selectOptions(
        screen.getByTestId('settings-sound-mention'),
        'ping',
      );

      expect(updateSettingMock).toHaveBeenCalledWith('reasonSounds', {
        mention: 'ping',
      });
    });

    it('selecting "Default" removes the override for that reason', async () => {
      renderWithProviders(<SystemSettings />, {
        updateSetting: updateSettingMock,
        settings: {
          ...mockSettings,
          playSound: true,
          reasonSounds: { mention: 'ping', ci_activity: 'glitch' },
        },
      });

      await userEvent.selectOptions(
        screen.getByTestId('settings-sound-mention'),
        'Default',
      );

      expect(updateSettingMock).toHaveBeenCalledWith('reasonSounds', {
        ci_activity: 'glitch',
      });
    });

    it('changing the default sound writes defaultSound', async () => {
      renderWithProviders(<SystemSettings />, {
        updateSetting: updateSettingMock,
        settings: { ...mockSettings, playSound: true },
      });

      await userEvent.selectOptions(
        screen.getByTestId('settings-sound-default'),
        'bell',
      );

      expect(updateSettingMock).toHaveBeenCalledWith('defaultSound', 'bell');
    });

    it('preview button plays the chosen sound for a reason', async () => {
      const playSpy = vi
        .spyOn(audio, 'raiseSoundNotification')
        .mockImplementation(vi.fn());

      renderWithProviders(<SystemSettings />, {
        updateSetting: updateSettingMock,
        settings: {
          ...mockSettings,
          playSound: true,
          notificationVolume: 40 as Percentage,
          reasonSounds: { mention: 'ping' },
        },
      });

      await userEvent.click(
        screen.getByTestId('settings-sound-mention-preview'),
      );

      expect(playSpy).toHaveBeenCalledWith(40, 'ping');
    });

    it('preview for an unmapped reason uses the default sound', async () => {
      const playSpy = vi
        .spyOn(audio, 'raiseSoundNotification')
        .mockImplementation(vi.fn());

      renderWithProviders(<SystemSettings />, {
        updateSetting: updateSettingMock,
        settings: {
          ...mockSettings,
          playSound: true,
          notificationVolume: 60 as Percentage,
          defaultSound: 'bell',
          reasonSounds: {},
        },
      });

      await userEvent.click(
        screen.getByTestId('settings-sound-comment-preview'),
      );

      expect(playSpy).toHaveBeenCalledWith(60, 'bell');
    });

    it('reset button restores reasonSounds to defaults', async () => {
      renderWithProviders(<SystemSettings />, {
        updateSetting: updateSettingMock,
        settings: {
          ...mockSettings,
          playSound: true,
          reasonSounds: { mention: 'pop' },
        },
      });

      await userEvent.click(screen.getByTestId('settings-sound-reset'));

      expect(updateSettingMock).toHaveBeenCalledWith(
        'reasonSounds',
        defaultSettings.reasonSounds,
      );
    });
  });

  it('should toggle the openAtStartup checkbox', async () => {
    await act(async () => {
      renderWithProviders(<SystemSettings />, {
        updateSetting: updateSettingMock,
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-openAtStartup'));

    expect(updateSettingMock).toHaveBeenCalledTimes(1);
    expect(updateSettingMock).toHaveBeenCalledWith('openAtStartup', true);
  });
});
