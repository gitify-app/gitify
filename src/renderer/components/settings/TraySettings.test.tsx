import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockAuth, mockSettings } from '../../__mocks__/state-mocks';
import { TraySettings } from './TraySettings';

describe('renderer/components/settings/TraySettings.tsx', () => {
  const mockUpdateSetting = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should toggle the showNotificationsCountInTray checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<TraySettings />, {
        auth: mockAuth,
        settings: mockSettings,
        updateSetting: mockUpdateSetting,
      });
    });

    await userEvent.click(
      screen.getByTestId('checkbox-showNotificationsCountInTray'),
    );

    expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
    expect(mockUpdateSetting).toHaveBeenCalledWith(
      'showNotificationsCountInTray',
      false,
    );
  });

  it('should toggle the useUnreadActiveIcon checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<TraySettings />, {
        auth: mockAuth,
        settings: mockSettings,
        updateSetting: mockUpdateSetting,
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-useUnreadActiveIcon'));

    expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
    expect(mockUpdateSetting).toHaveBeenCalledWith(
      'useUnreadActiveIcon',
      false,
    );
  });

  it('should toggle the useAlternateIdleIcon checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<TraySettings />, {
        auth: mockAuth,
        settings: mockSettings,
        updateSetting: mockUpdateSetting,
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-useAlternateIdleIcon'));

    expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
    expect(mockUpdateSetting).toHaveBeenCalledWith(
      'useAlternateIdleIcon',
      true,
    );
  });
});
