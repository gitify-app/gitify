import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockAuth, mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import { TraySettings } from './TraySettings';

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
          <TraySettings />
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

  it('should toggle the useUnreadActiveIcon checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <TraySettings />
        </AppContext.Provider>,
      );
    });

    await userEvent.click(screen.getByTestId('checkbox-useUnreadActiveIcon'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('useUnreadActiveIcon', false);
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
          <TraySettings />
        </AppContext.Provider>,
      );
    });

    await userEvent.click(screen.getByTestId('checkbox-useAlternateIdleIcon'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('useAlternateIdleIcon', true);
  });
});
