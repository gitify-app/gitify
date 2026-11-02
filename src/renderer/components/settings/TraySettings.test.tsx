import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';

import { useSettingsStore } from '../../stores';

import { TraySettings } from './TraySettings';

describe('renderer/components/settings/TraySettings.tsx', () => {
  let toggleSettingSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    toggleSettingSpy = vi.spyOn(useSettingsStore.getState(), 'toggleSetting');

    await act(async () => {
      renderWithProviders(<TraySettings />);
    });
  });

  it.each([
    ['Show notification count', 'showNotificationsCountInTray'],
    ['Highlight unread notifications', 'useUnreadActiveIcon'],
  ] as const)('toggles %s switch', async (label, setting) => {
    await userEvent.click(screen.getByRole('button', { name: label }));

    expect(toggleSettingSpy).toHaveBeenCalledTimes(1);
    expect(toggleSettingSpy).toHaveBeenCalledWith(setting);
  });
  it.each(['auto', 'light', 'dark'] as const)(
    'selects the %s icon appearance',
    async (appearance) => {
      await userEvent.click(screen.getByTestId(`choice-trayIconAppearance-${appearance}`));
      expect(useSettingsStore.getState().trayIconAppearance).toBe(appearance);
    },
  );
});

describe('renderer/components/settings/TraySettings.tsx notification count visibility', () => {
  // `window.gitify` is rebuilt in a global `beforeEach`, so the mocks are read
  // inside each test.
  const platformMocks = () =>
    window.gitify.platform as unknown as Record<
      'isLinux' | 'isMacOS' | 'isWindows',
      ReturnType<typeof vi.fn>
    >;

  it.each([
    ['macOS', 'isMacOS', true],
    ['Linux', 'isLinux', true],
    ['Windows', 'isWindows', false],
  ] as const)('on %s, shows the count switch: %s', async (_name, predicate, visible) => {
    const mocks = platformMocks();
    for (const key of ['isLinux', 'isMacOS', 'isWindows'] as const) {
      mocks[key].mockReturnValue(key === predicate);
    }

    await act(async () => {
      renderWithProviders(<TraySettings />);
    });

    expect(screen.queryByRole('button', { name: 'Show notification count' }) !== null).toBe(
      visible,
    );
  });
});
