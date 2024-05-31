import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { useContext } from 'react';
import { mockAuth, mockSettings } from '../__mocks__/state-mocks';
import { useNotifications } from '../hooks/useNotifications';
import type { AuthState, SettingsState } from '../types';
import * as apiRequests from '../utils/api/request';
import * as comms from '../utils/comms';
import Constants from '../utils/constants';
import * as notifications from '../utils/notifications';
import * as storage from '../utils/storage';
import { AppContext, AppProvider } from './App';

jest.mock('../hooks/useNotifications');

const customRender = (
  ui,
  auth: AuthState = mockAuth,
  settings: SettingsState = mockSettings,
) => {
  return render(
    <AppContext.Provider value={{ auth, settings }}>
      <AppProvider>{ui}</AppProvider>
    </AppContext.Provider>,
  );
};

describe('context/App.tsx', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  describe('notification methods', () => {
    const getNotificationCountMock = jest.spyOn(
      notifications,
      'getNotificationCount',
    );
    getNotificationCountMock.mockReturnValue(1);

    const fetchNotificationsMock = jest.fn();
    const markNotificationReadMock = jest.fn();
    const markNotificationDoneMock = jest.fn();
    const unsubscribeNotificationMock = jest.fn();
    const markRepoNotificationsMock = jest.fn();
    const markRepoNotificationsDoneMock = jest.fn();

    beforeEach(() => {
      (useNotifications as jest.Mock).mockReturnValue({
        fetchNotifications: fetchNotificationsMock,
        markNotificationRead: markNotificationReadMock,
        markNotificationDone: markNotificationDoneMock,
        unsubscribeNotification: unsubscribeNotificationMock,
        markRepoNotifications: markRepoNotificationsMock,
        markRepoNotificationsDone: markRepoNotificationsDoneMock,
      });
    });

    it('fetch notifications every minute', async () => {
      customRender(null);

      // Wait for the useEffects, for settings.participating and accounts, to run.
      // Those aren't what we're testing
      await waitFor(() =>
        expect(fetchNotificationsMock).toHaveBeenCalledTimes(1),
      );

      fetchNotificationsMock.mockReset();

      act(() => {
        jest.advanceTimersByTime(Constants.FETCH_INTERVAL);
        return;
      });
      expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);

      act(() => {
        jest.advanceTimersByTime(Constants.FETCH_INTERVAL);
        return;
      });
      expect(fetchNotificationsMock).toHaveBeenCalledTimes(2);

      act(() => {
        jest.advanceTimersByTime(Constants.FETCH_INTERVAL);
        return;
      });
      expect(fetchNotificationsMock).toHaveBeenCalledTimes(3);
    });

    it('should call fetchNotifications', async () => {
      const TestComponent = () => {
        const { fetchNotifications } = useContext(AppContext);

        return (
          <button type="button" onClick={fetchNotifications}>
            Test Case
          </button>
        );
      };

      const { getByText } = customRender(<TestComponent />);

      fetchNotificationsMock.mockReset();

      fireEvent.click(getByText('Test Case'));

      expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);
    });

    it('should call markNotificationRead', async () => {
      const TestComponent = () => {
        const { markNotificationRead } = useContext(AppContext);

        return (
          <button
            type="button"
            onClick={() => markNotificationRead('123-456', 'github.com')}
          >
            Test Case
          </button>
        );
      };

      const { getByText } = customRender(<TestComponent />);

      markNotificationReadMock.mockReset();

      fireEvent.click(getByText('Test Case'));

      expect(markNotificationReadMock).toHaveBeenCalledTimes(1);
      expect(markNotificationReadMock).toHaveBeenCalledWith(
        {
          accounts: [],
          enterpriseAccounts: [],
          token: null,
          user: null,
        },
        mockSettings,
        '123-456',
        'github.com',
      );
    });

    it('should call markNotificationDone', async () => {
      const TestComponent = () => {
        const { markNotificationDone } = useContext(AppContext);

        return (
          <button
            type="button"
            onClick={() => markNotificationDone('123-456', 'github.com')}
          >
            Test Case
          </button>
        );
      };

      const { getByText } = customRender(<TestComponent />);

      markNotificationDoneMock.mockReset();

      fireEvent.click(getByText('Test Case'));

      expect(markNotificationDoneMock).toHaveBeenCalledTimes(1);
      expect(markNotificationDoneMock).toHaveBeenCalledWith(
        { accounts: [], enterpriseAccounts: [], token: null, user: null },
        mockSettings,
        '123-456',
        'github.com',
      );
    });

    it('should call unsubscribeNotification', async () => {
      const TestComponent = () => {
        const { unsubscribeNotification } = useContext(AppContext);

        return (
          <button
            type="button"
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
        { accounts: [], enterpriseAccounts: [], token: null, user: null },
        mockSettings,
        '123-456',
        'github.com',
      );
    });

    it('should call markRepoNotifications', async () => {
      const TestComponent = () => {
        const { markRepoNotifications } = useContext(AppContext);

        return (
          <button
            type="button"
            onClick={() =>
              markRepoNotifications(
                'gitify-app/notifications-test',
                'github.com',
              )
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
        { accounts: [], enterpriseAccounts: [], token: null, user: null },
        mockSettings,
        'gitify-app/notifications-test',
        'github.com',
      );
    });

    it('should call loginWithPersonalAccessToken', async () => {
      const apiRequestAuthMock = jest.spyOn(apiRequests, 'apiRequestAuth');
      apiRequestAuthMock.mockResolvedValueOnce(null);

      const TestComponent = () => {
        const { loginWithPersonalAccessToken } = useContext(AppContext);

        return (
          <button
            type="button"
            onClick={() =>
              loginWithPersonalAccessToken({
                hostname: 'github.com',
                token: '123-456',
              })
            }
          >
            Test Case
          </button>
        );
      };

      const { getByText } = customRender(<TestComponent />);

      fireEvent.click(getByText('Test Case'));

      await waitFor(() =>
        expect(fetchNotificationsMock).toHaveBeenCalledTimes(1),
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

      return (
        <button type="button" onClick={logout}>
          Test Case
        </button>
      );
    };

    const { getByText } = customRender(<TestComponent />);

    act(() => {
      fireEvent.click(getByText('Test Case'));
    });

    expect(clearStateMock).toHaveBeenCalledTimes(1);
  });

  describe('settings methods', () => {
    it('should call updateSetting', async () => {
      const saveStateMock = jest
        .spyOn(storage, 'saveState')
        .mockImplementation(jest.fn());

      const TestComponent = () => {
        const { updateSetting } = useContext(AppContext);

        return (
          <button
            type="button"
            onClick={() => updateSetting('participating', true)}
          >
            Test Case
          </button>
        );
      };

      const { getByText } = customRender(<TestComponent />);

      act(() => {
        fireEvent.click(getByText('Test Case'));
      });

      expect(saveStateMock).toHaveBeenCalledWith({
        auth: { accounts: [], enterpriseAccounts: [], token: null, user: null },
        settings: {
          participating: true,
          playSound: true,
          showNotifications: true,
          showBots: true,
          showNotificationsCountInTray: false,
          openAtStartup: false,
          theme: 'SYSTEM',
          detailedNotifications: true,
          markAsDoneOnOpen: false,
          showAccountHostname: false,
          delayNotificationState: false,
        },
      });
    });

    it('should call updateSetting and set auto launch(openAtStartup)', async () => {
      const setAutoLaunchMock = jest.spyOn(comms, 'setAutoLaunch');
      const saveStateMock = jest
        .spyOn(storage, 'saveState')
        .mockImplementation(jest.fn());

      const TestComponent = () => {
        const { updateSetting } = useContext(AppContext);

        return (
          <button
            type="button"
            onClick={() => updateSetting('openAtStartup', true)}
          >
            Test Case
          </button>
        );
      };

      const { getByText } = customRender(<TestComponent />);

      act(() => {
        fireEvent.click(getByText('Test Case'));
      });

      expect(setAutoLaunchMock).toHaveBeenCalledWith(true);

      expect(saveStateMock).toHaveBeenCalledWith({
        auth: { accounts: [], enterpriseAccounts: [], token: null, user: null },
        settings: {
          participating: false,
          playSound: true,
          showNotifications: true,
          showBots: true,
          showNotificationsCountInTray: false,
          openAtStartup: true,
          theme: 'SYSTEM',
          detailedNotifications: true,
          markAsDoneOnOpen: false,
          showAccountHostname: false,
          delayNotificationState: false,
        },
      });
    });
  });
});
