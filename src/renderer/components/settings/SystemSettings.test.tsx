import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';
import { mockSettings } from '../../__mocks__/state-mocks';

import { useLoginItemStatus } from '../../hooks/useLoginItemStatus';
import { useSettingsStore } from '../../stores';

import type { KeyboardAcceleratorShortcut } from '../../types';

import { SystemSettings } from './SystemSettings';

vi.mock('../../hooks/useLoginItemStatus', () => ({
  useLoginItemStatus: vi.fn(() => null),
}));

describe('renderer/components/settings/SystemSettings.tsx', () => {
  let toggleSettingSpy: ReturnType<typeof vi.spyOn>;
  let updateSettingSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    toggleSettingSpy = vi.spyOn(useSettingsStore.getState(), 'toggleSetting');
    updateSettingSpy = vi.spyOn(useSettingsStore.getState(), 'updateSetting');
    vi.mocked(useLoginItemStatus).mockReturnValue(null);
  });

  it('changes the link focus choice', async () => {
    await act(async () => {
      renderWithProviders(<SystemSettings />);
    });

    await userEvent.click(screen.getByTestId('choice-openLinks-background'));

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith('openLinks', 'BACKGROUND');
  });

  it.each([
    ['Enable global shortcut', 'keyboardShortcut'],
    ['Launch at startup', 'openAtStartup'],
    ['Keep window open when unfocused', 'keepWindowOnBlur'],
  ] as const)('toggles %s switch', async (label, setting) => {
    await act(async () => {
      renderWithProviders(<SystemSettings />);
    });

    await userEvent.click(screen.getByRole('button', { name: label }));

    expect(toggleSettingSpy).toHaveBeenCalledTimes(1);
    expect(toggleSettingSpy).toHaveBeenCalledWith(setting);
  });

  describe('X11 backend switch', () => {
    // `window.gitify` is rebuilt in a global `beforeEach`, so the mock has to
    // be read inside each test rather than captured at describe scope.
    const isLinuxMock = () => window.gitify.platform.isLinux as unknown as ReturnType<typeof vi.fn>;

    it('is hidden off Linux', async () => {
      isLinuxMock().mockReturnValue(false);

      await act(async () => {
        renderWithProviders(<SystemSettings />);
      });

      expect(screen.queryByTestId('switch-useX11Backend')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'GNOME extension installation' }),
      ).not.toBeInTheDocument();
    });

    it('is shown and toggles on Linux', async () => {
      isLinuxMock().mockReturnValue(true);

      await act(async () => {
        renderWithProviders(<SystemSettings />);
      });

      await userEvent.click(
        screen.getByRole('button', { name: 'Use X11 backend (restart required)' }),
      );

      expect(toggleSettingSpy).toHaveBeenCalledWith('useX11Backend');
    });

    it('evaluates the Linux platform predicate once per render', async () => {
      isLinuxMock().mockReturnValue(true);

      await act(async () => {
        renderWithProviders(<SystemSettings />);
      });

      expect(isLinuxMock()).toHaveBeenCalledTimes(1);
    });

    it('opens standalone GNOME installation instructions on Linux', async () => {
      isLinuxMock().mockReturnValue(true);
      renderWithProviders(<SystemSettings />);

      await userEvent.click(screen.getByRole('button', { name: 'GNOME extension installation' }));

      expect(window.gitify.openExternalLink).toHaveBeenCalledWith(
        'https://github.com/gitify-app/gnome#install',
        expect.any(Boolean),
      );
    });
  });

  it('resets global shortcut to default when customized', async () => {
    renderWithProviders(<SystemSettings />, {
      settings: {
        ...mockSettings,
        openGitifyShortcut: 'CommandOrControl+Shift+X' as KeyboardAcceleratorShortcut,
      },
    });

    await userEvent.click(screen.getByTestId('settings-shortcut-reset'));

    expect(updateSettingSpy).toHaveBeenCalledWith(
      'openGitifyShortcut',
      useSettingsStore.getInitialState().openGitifyShortcut,
    );
  });

  it('does not render the shortcut group when the shortcut is disabled', () => {
    renderWithProviders(<SystemSettings />, {
      settings: { ...mockSettings, keyboardShortcut: false },
    });

    expect(screen.getByTestId('reveal-shortcutRecorder')).toHaveAttribute('data-state', 'closed');
  });

  it('shows the shortcut rules on the recorder row', async () => {
    renderWithProviders(<SystemSettings />, {
      settings: { ...mockSettings, keyboardShortcut: true },
    });

    expect(screen.getByText('Global shortcut')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Help: Global shortcut' }));

    expect(screen.getByText('Shortcuts must include:')).toBeInTheDocument();
  });

  describe('recording global shortcut', () => {
    it('enters recording mode and shows "Press keys…" prompt', async () => {
      renderWithProviders(<SystemSettings />, {
        settings: { ...mockSettings, keyboardShortcut: true },
      });

      await userEvent.click(screen.getByTestId('settings-shortcut-edit'));

      expect(screen.getByText('Press keys…')).toBeInTheDocument();
    });

    it('shows live modifier keys as they are pressed', async () => {
      renderWithProviders(<SystemSettings />, {
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

    it('finalizes shortcut when a non-modifier key is pressed', async () => {
      renderWithProviders(<SystemSettings />, {
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

      expect(updateSettingSpy).toHaveBeenCalledWith(
        'openGitifyShortcut',
        'CommandOrControl+Shift+G',
      );
      // Recording mode should exit
      expect(screen.queryByText('Click outside this area to cancel.')).not.toBeInTheDocument();
    });

    it('cancels recording when clicking outside the shortcut area', async () => {
      renderWithProviders(<SystemSettings />, {
        settings: { ...mockSettings, keyboardShortcut: true },
      });

      await userEvent.click(screen.getByTestId('settings-shortcut-edit'));
      expect(screen.getByText('Press keys…')).toBeInTheDocument();

      // Click somewhere outside the shortcut row
      await userEvent.click(document.body);

      expect(screen.queryByText('Click outside this area to cancel.')).not.toBeInTheDocument();
    });
  });

  describe('login item status', () => {
    it.each([
      ['requires-approval', /requires you to approve the login item/],
      ['not-found', /The login item could not be found/],
      ['not-registered', /the login item is not registered/],
    ] as const)('warns when macOS reports %s', async (status, warning) => {
      vi.mocked(useLoginItemStatus).mockReturnValue({
        openAtLogin: true,
        status,
      });

      await act(async () => {
        renderWithProviders(<SystemSettings />, {
          settings: { ...mockSettings, openAtStartup: true },
        });
      });

      expect(screen.getByText(warning)).toBeInTheDocument();
    });

    it('warns when Windows has disabled the startup entry', async () => {
      vi.mocked(window.gitify.platform.isMacOS).mockReturnValue(false);
      vi.mocked(window.gitify.platform.isWindows).mockReturnValue(true);
      vi.mocked(useLoginItemStatus).mockReturnValue({
        openAtLogin: true,
        executableWillLaunchAtLogin: false,
      });

      await act(async () => {
        renderWithProviders(<SystemSettings />, {
          settings: { ...mockSettings, openAtStartup: true },
        });
      });

      expect(screen.getByText(/Windows has disabled the startup entry/)).toBeInTheDocument();
    });

    it('does not warn when the stored preference is off', async () => {
      vi.mocked(useLoginItemStatus).mockReturnValue({
        openAtLogin: true,
        status: 'requires-approval',
      });

      await act(async () => {
        renderWithProviders(<SystemSettings />, {
          settings: { ...mockSettings, openAtStartup: false },
        });
      });

      expect(screen.queryByText(/requires you to approve the login item/)).not.toBeInTheDocument();
    });

    it('does not warn when the login item is enabled', async () => {
      vi.mocked(useLoginItemStatus).mockReturnValue({
        openAtLogin: true,
        status: 'enabled',
      });

      await act(async () => {
        renderWithProviders(<SystemSettings />, {
          settings: { ...mockSettings, openAtStartup: true },
        });
      });

      expect(screen.queryByText(/login item/)).not.toBeInTheDocument();
    });

    it('does not warn when the status read fails', async () => {
      vi.mocked(useLoginItemStatus).mockReturnValue(null);

      await act(async () => {
        renderWithProviders(<SystemSettings />, {
          settings: { ...mockSettings, openAtStartup: true },
        });
      });

      expect(screen.queryByText(/login item/)).not.toBeInTheDocument();
    });

    it('does not warn on Linux, where the control is hidden', async () => {
      vi.mocked(window.gitify.platform.isLinux).mockReturnValue(true);
      vi.mocked(useLoginItemStatus).mockReturnValue({
        openAtLogin: true,
        status: 'requires-approval',
      });

      await act(async () => {
        renderWithProviders(<SystemSettings />, {
          settings: { ...mockSettings, openAtStartup: true },
        });
      });

      expect(screen.queryByText(/requires you to approve the login item/)).not.toBeInTheDocument();
    });
  });
});
