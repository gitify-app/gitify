import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';

import { useSettingsStore } from '../../stores';

import { TraySettings } from './TraySettings';

describe('renderer/components/settings/TraySettings.tsx', () => {
  let updateSettingSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    updateSettingSpy = vi.spyOn(useSettingsStore.getState(), 'updateSetting');

    renderWithAppContext(<TraySettings />);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should toggle the showNotificationsCountInTray checkbox', async () => {
    await userEvent.click(
      screen.getByTestId('checkbox-showNotificationsCountInTray'),
    );

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith(
      'showNotificationsCountInTray',
      false,
    );
  });

  it('should toggle the useUnreadActiveIcon checkbox', async () => {
    await userEvent.click(screen.getByTestId('checkbox-useUnreadActiveIcon'));

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith('useUnreadActiveIcon', false);
  });

  it('should toggle the useAlternateIdleIcon checkbox', async () => {
    await userEvent.click(screen.getByTestId('checkbox-useAlternateIdleIcon'));

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith('useAlternateIdleIcon', true);
  });
});
