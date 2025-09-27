import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockAuth, mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import { SystemSettings } from './SystemSettings';

describe('renderer/components/settings/TraySettings.tsx', () => {
  const updateSetting = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should toggle the showNotificationsCountInTray checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <SystemSettings />
        </AppContext.Provider>,
      );
    });

    await userEvent.click(
      screen.getByTestId('checkbox-showNotificationsCountInTray'),
    );

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith(
      'showNotificationsCountInTray',
      false,
    );
  });

  it('should toggle the useAlternateIdleIcon checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <SystemSettings />
        </AppContext.Provider>,
      );
    });

    await userEvent.click(screen.getByTestId('checkbox-useAlternateIdleIcon'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('useAlternateIdleIcon', true);
  });

  it('should toggle the trayIconStatusColors checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <SystemSettings />
        </AppContext.Provider>,
      );
    });

    await userEvent.click(screen.getByTestId('checkbox-trayIconStatusColors'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('trayIconStatusColors', true);
  });
});
