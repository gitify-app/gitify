import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';

import { useSettingsStore } from '../../stores';

import { TraySettings } from './TraySettings';

describe('renderer/components/settings/TraySettings.tsx', () => {
  let toggleSettingSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    toggleSettingSpy = vi.spyOn(useSettingsStore.getState(), 'toggleSetting');

    renderWithAppContext(<TraySettings />);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should toggle the showNotificationsCountInTray checkbox', async () => {
    await userEvent.click(
      screen.getByTestId('checkbox-showNotificationsCountInTray'),
    );

    expect(toggleSettingSpy).toHaveBeenCalledTimes(1);
    expect(toggleSettingSpy).toHaveBeenCalledWith(
      'showNotificationsCountInTray',
    );
  });

  it('should toggle the useUnreadActiveIcon checkbox', async () => {
    await userEvent.click(screen.getByTestId('checkbox-useUnreadActiveIcon'));

    expect(toggleSettingSpy).toHaveBeenCalledTimes(1);
    expect(toggleSettingSpy).toHaveBeenCalledWith('useUnreadActiveIcon');
  });

  it('should toggle the useAlternateIdleIcon checkbox', async () => {
    await userEvent.click(screen.getByTestId('checkbox-useAlternateIdleIcon'));

    expect(toggleSettingSpy).toHaveBeenCalledTimes(1);
    expect(toggleSettingSpy).toHaveBeenCalledWith('useAlternateIdleIcon');
  });
});
