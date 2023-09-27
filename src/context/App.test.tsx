import React, { useContext } from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';

import { AppContext, AppProvider } from './App';
import { AuthState, SettingsState } from '../types';
import { mockAccounts, mockSettings } from '../__mocks__/mock-state';
import { useNotifications } from '../hooks/useNotifications';
import * as apiRequests from '../utils/api-requests';
import * as comms from '../utils/comms';
import * as storage from '../utils/storage';

jest.mock('../hooks/useNotifications');

const customRender = (
  ui,
  accounts: AuthState = mockAccounts,
  settings: SettingsState = mockSettings,
) => {
  return render(
    <AppContext.Provider value={{ accounts, settings }}>
      <AppProvider>{ui}</AppProvider>
    </AppContext.Provider>,
  );
};

describe('context/App.tsx', () => {
  beforeEach(() => {
    // FIXME: Couldn't get the timers working in modern mode, deferring
    jest.useFakeTimers('legacy');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('api methods', () => {
    const apiRequestAuthMock = jest.spyOn(apiRequests, 'apiRequestAuth');

    const fetchNotificationsMock = jest.fn();
    const markNotificationMock = jest.fn();
    const unsubscribeNotificationMock = jest.fn();
    const markRepoNotificationsMock = jest.fn();

    beforeEach(() => {
      (useNotifications as jest.Mock).mockReturnValue({
        fetchNotifications: fetchNotificationsMock,
        markNotification: markNotificationMock,
        unsubscribeNotification: unsubscribeNotificationMock,
        markRepoNotifications: markRepoNotificationsMock,
      });
    });

    it('fetch notifications every minute', async () => {
      customRender(null);

      await waitFor(() =>
        expect(fetchNotificationsMock).toHaveBeenCalledTimes(2),
      );

      fetchNotificationsMock.mockReset();

      act(() => jest.advanceTimersByTime(60000));
      expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);

      act(() => jest.advanceTimersByTime(60000));
      expect(fetchNotificationsMock).toHaveBeenCalledTimes(2);

      act(() => jest.advanceTimersByTime(60000));
      expect(fetchNotificationsMock).toHaveBeenCalledTimes(3);
    });

    it('should call fetchNotifications', async () => {
      const TestComponent = () => {
        const { fetchNotifications } = useContext(AppContext);

        return <button onClick={fetchNotifications}>Test Case</button>;
      };

      const { getByText } = customRender(<TestComponent />);

      fetchNotificationsMock.mockReset();

      fireEvent.click(getByText('Test Case'));

      expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);
    });

    it('should call markNotification', async () => {
      const TestComponent = () => {
        const { markNotification } = useContext(AppContext);

        return (
          <button onClick={() => markNotification('123-456', 'github.com')}>
            Test Case
          </button>
        );
      };

      const { getByText } = customRender(<TestComponent />);

      markNotificationMock.mockReset();

      fireEvent.click(getByText('Test Case'));

      expect(markNotificationMock).toHaveBeenCalledTimes(1);
      expect(markNotificationMock).toHaveBeenCalledWith(
        { enterpriseAccounts: [], token: null, user: null },
        '123-456',
        'github.com',
      );
    });

    it('should call unsubscribeNotification', async () => {
      const TestComponent = () => {
        const { unsubscribeNotification } = useContext(AppContext);

        return (
          <button
            onClick={() => unsubscribeNotification('123-456', 'github.com')}
          >
            Test Case
          </button>
        );
      };

      const { getByText } = customRender(<TestComponent />);

      unsubscribeNotificationMock.mockReset();

      fireEvent.click(getByText('Test Case'));

      expect(unsubscribeNotificationMock).toHaveBeenCalledTimes(1);
      expect(unsubscribeNotificationMock).toHaveBeenCalledWith(
        { enterpriseAccounts: [], token: null, user: null },
        '123-456',
        'github.com',
      );
    });

    it('should call markRepoNotifications', async () => {
      const TestComponent = () => {
        const { markRepoNotifications } = useContext(AppContext);

        return (
          <button
            onClick={() =>
              markRepoNotifications('manosim/gitify', 'github.com')
            }
          >
            Test Case
          </button>
        );
      };

      const { getByText } = customRender(<TestComponent />);

      markRepoNotificationsMock.mockReset();

      fireEvent.click(getByText('Test Case'));

      expect(markRepoNotificationsMock).toHaveBeenCalledTimes(1);
      expect(markRepoNotificationsMock).toHaveBeenCalledWith(
        { enterpriseAccounts: [], token: null, user: null },
        'manosim/gitify',
        'github.com',
      );
    });

    it('should call validateToken', async () => {
      apiRequestAuthMock.mockResolvedValueOnce(null);

      const TestComponent = () => {
        const { validateToken } = useContext(AppContext);

        return (
          <button
            onClick={() =>
              validateToken({ hostname: 'github.com', token: '123-456' })
            }
          >
            Test Case
          </button>
        );
      };

      const { getByText } = customRender(<TestComponent />);

      fireEvent.click(getByText('Test Case'));

      await waitFor(() =>
        expect(fetchNotificationsMock).toHaveBeenCalledTimes(2),
      );

      expect(apiRequestAuthMock).toHaveBeenCalledTimes(2);
      expect(apiRequestAuthMock).toHaveBeenCalledWith(
        'https://api.github.com/notifications',
        'HEAD',
        '123-456',
      );
      expect(apiRequestAuthMock).toHaveBeenCalledWith(
        'https://api.github.com/user',
        'GET',
        '123-456',
      );
    });
  });

  it('should call logout', async () => {
    const clearStateMock = jest.spyOn(storage, 'clearState');

    const TestComponent = () => {
      const { logout } = useContext(AppContext);

      return <button onClick={logout}>Test Case</button>;
    };

    const { getByText } = customRender(<TestComponent />);

    act(() => {
      fireEvent.click(getByText('Test Case'));
    });

    expect(clearStateMock).toHaveBeenCalledTimes(1);
  });

  it('should call updateSetting', async () => {
    const saveStateMock = jest
      .spyOn(storage, 'saveState')
      .mockImplementation(jest.fn());

    const TestComponent = () => {
      const { updateSetting } = useContext(AppContext);

      return (
        <button onClick={() => updateSetting('participating', true)}>
          Test Case
        </button>
      );
    };

    const { getByText } = customRender(<TestComponent />);

    act(() => {
      fireEvent.click(getByText('Test Case'));
    });

    expect(saveStateMock).toHaveBeenCalledWith(
      { enterpriseAccounts: [], token: null, user: null },
      {
        appearance: 'SYSTEM',
        markOnClick: false,
        openAtStartup: false,
        participating: true,
        playSound: true,
        showNotifications: true,
        colors: true,
      },
    );
  });

  it('should call updateSetting and set auto launch(openAtStartup)', async () => {
    const setAutoLaunchMock = jest.spyOn(comms, 'setAutoLaunch');
    const saveStateMock = jest
      .spyOn(storage, 'saveState')
      .mockImplementation(jest.fn());

    const TestComponent = () => {
      const { updateSetting } = useContext(AppContext);

      return (
        <button onClick={() => updateSetting('openAtStartup', true)}>
          Test Case
        </button>
      );
    };

    const { getByText } = customRender(<TestComponent />);

    act(() => {
      fireEvent.click(getByText('Test Case'));
    });

    expect(setAutoLaunchMock).toHaveBeenCalledWith(true);

    expect(saveStateMock).toHaveBeenCalledWith(
      { enterpriseAccounts: [], token: null, user: null },
      {
        appearance: 'SYSTEM',
        markOnClick: false,
        openAtStartup: true,
        participating: false,
        playSound: true,
        showNotifications: true,
        colors: true,
      },
    );
  });
});
