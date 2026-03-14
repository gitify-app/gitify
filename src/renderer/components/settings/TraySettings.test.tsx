import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';

import { useSettingsStore } from '../../stores';
import { TraySettings } from './TraySettings';

describe('renderer/components/settings/TraySettings.tsx', () => {
  const updateSettingMock = vi.fn();

  beforeEach(() => {
    useSettingsStore.setState({ updateSetting: updateSettingMock as any });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should toggle the showNotificationsCountInTray checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<TraySettings />);
    });

    await userEvent.click(
      screen.getByTestId('checkbox-showNotificationsCountInTray'),
    );

    expect(updateSettingMock).toHaveBeenCalledTimes(1);
    expect(updateSettingMock).toHaveBeenCalledWith(
      'showNotificationsCountInTray',
      false,
    );
  });

  it('should toggle the useUnreadActiveIcon checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<TraySettings />);
    });

    await userEvent.click(screen.getByTestId('checkbox-useUnreadActiveIcon'));

    expect(updateSettingMock).toHaveBeenCalledTimes(1);
    expect(updateSettingMock).toHaveBeenCalledWith(
      'useUnreadActiveIcon',
      false,
    );
  });

  it('should toggle the useAlternateIdleIcon checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<TraySettings />);
    });

    await userEvent.click(screen.getByTestId('checkbox-useAlternateIdleIcon'));

    expect(updateSettingMock).toHaveBeenCalledTimes(1);
    expect(updateSettingMock).toHaveBeenCalledWith(
      'useAlternateIdleIcon',
      true,
    );
  });
});
