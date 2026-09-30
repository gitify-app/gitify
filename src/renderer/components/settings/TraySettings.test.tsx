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
    ['checkbox-showNotificationsCountInTray', 'showNotificationsCountInTray'],
    ['checkbox-useUnreadActiveIcon', 'useUnreadActiveIcon'],
  ] as const)('should toggle %s checkbox', async (testId, setting) => {
    await userEvent.click(screen.getByTestId(testId));

    expect(toggleSettingSpy).toHaveBeenCalledTimes(1);
    expect(toggleSettingSpy).toHaveBeenCalledWith(setting);
  });
  it.each(['auto', 'light', 'dark'] as const)(
    'selects the %s icon appearance',
    async (appearance) => {
      await userEvent.click(screen.getByTestId(`radio-trayIconAppearance-${appearance}`));
      expect(useSettingsStore.getState().trayIconAppearance).toBe(appearance);
    },
  );
});
