import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { useContext } from 'react';
import { mockAuth, mockSettings } from '../__mocks__/state-mocks';
import { useNotifications } from '../hooks/useNotifications';
import type { AuthState, Hostname, SettingsState, Token } from '../types';
import { mockSingleNotification } from '../utils/api/__mocks__/response-mocks';
import * as apiRequests from '../utils/api/request';
import * as comms from '../utils/comms';
import { Constants } from '../utils/constants';
import * as notifications from '../utils/notifications';
import * as storage from '../utils/storage';
import { AppContext, AppProvider, defaultSettings } from './App';

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
    const markRepoNotificationsReadMock = jest.fn();
    const markRepoNotificationsDoneMock = jest.fn();

    const mockDefaultState = {
      auth: { accounts: [], enterpriseAccounts: [], token: null, user: null },
      settings: mockSettings,
    };

    beforeEach(() => {
      (useNotifications as jest.Mock).mockReturnValue({
        fetchNotifications: fetchNotificationsMock,
        markNotificationRead: markNotificationReadMock,
        markNotificationDone: markNotificationDoneMock,
        unsubscribeNotification: unsubscribeNotificationMock,
        markRepoNotificationsRead: markRepoNotificationsReadMock,
        markRepoNotificationsDone: markRepoNotificationsDoneMock,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('fetch notifications every minute', async () => {
      customRender(null);

      // Wait for the useEffects, for settings.participating and accounts, to run.
      // Those aren't what we're testing
      await waitFor(() =>
        expect(fetchNotificationsMock).toHaveBeenCalledTimes(1),
      );

      act(() => {
        jest.advanceTimersByTime(Constants.FETCH_NOTIFICATIONS_INTERVAL);
        return;
      });
      expect(fetchNotificationsMock).toHaveBeenCalledTimes(2);

      act(() => {
        jest.advanceTimersByTime(Constants.FETCH_NOTIFICATIONS_INTERVAL);
        return;
      });
      expect(fetchNotificationsMock).toHaveBeenCalledTimes(3);

      act(() => {
        jest.advanceTimersByTime(Constants.FETCH_NOTIFICATIONS_INTERVAL);
        return;
      });
      expect(fetchNotificationsMock).toHaveBeenCalledTimes(4);
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
            onClick={() => markNotificationRead(mockSingleNotification)}
          >
            Test Case
          </button>
        );
      };

      const { getByText } = customRender(<TestComponent />);

      fireEvent.click(getByText('Test Case'));

      expect(markNotificationReadMock).toHaveBeenCalledTimes(1);
      expect(markNotificationReadMock).toHaveBeenCalledWith(
        mockDefaultState,
        mockSingleNotification,
      );
    });

    it('should call markNotificationDone', async () => {
      const TestComponent = () => {
        const { markNotificationDone } = useContext(AppContext);

        return (
          <button
            type="button"
            onClick={() => markNotificationDone(mockSingleNotification)}
          >
            Test Case
          </button>
        );
      };

      const { getByText } = customRender(<TestComponent />);

      fireEvent.click(getByText('Test Case'));

      expect(markNotificationDoneMock).toHaveBeenCalledTimes(1);
      expect(markNotificationDoneMock).toHaveBeenCalledWith(
        mockDefaultState,
        mockSingleNotification,
      );
    });

    it('should call unsubscribeNotification', async () => {
      const TestComponent = () => {
        const { unsubscribeNotification } = useContext(AppContext);

        return (
          <button
            type="button"
            onClick={() => unsubscribeNotification(mockSingleNotification)}
          >
            Test Case
          </button>
        );
      };

      const { getByText } = customRender(<TestComponent />);

      fireEvent.click(getByText('Test Case'));

      expect(unsubscribeNotificationMock).toHaveBeenCalledTimes(1);
      expect(unsubscribeNotificationMock).toHaveBeenCalledWith(
        mockDefaultState,
        mockSingleNotification,
      );
    });

    it('should call markRepoNotificationsRead', async () => {
      const TestComponent = () => {
        const { markRepoNotificationsRead } = useContext(AppContext);

        return (
          <button
            type="button"
            onClick={() => markRepoNotificationsRead(mockSingleNotification)}
          >
            Test Case
          </button>
        );
      };

      const { getByText } = customRender(<TestComponent />);

      fireEvent.click(getByText('Test Case'));

      expect(markRepoNotificationsReadMock).toHaveBeenCalledTimes(1);
      expect(markRepoNotificationsReadMock).toHaveBeenCalledWith(
        mockDefaultState,
        mockSingleNotification,
      );
    });

    it('should call markRepoNotificationsDone', async () => {
      const TestComponent = () => {
        const { markRepoNotificationsDone } = useContext(AppContext);

        return (
          <button
            type="button"
            onClick={() => markRepoNotificationsDone(mockSingleNotification)}
          >
            Test Case
          </button>
        );
      };

      const { getByText } = customRender(<TestComponent />);

      fireEvent.click(getByText('Test Case'));

      expect(markRepoNotificationsDoneMock).toHaveBeenCalledTimes(1);
      expect(markRepoNotificationsDoneMock).toHaveBeenCalledWith(
        {
          auth: {
            accounts: [],
            enterpriseAccounts: [],
            token: null,
            user: null,
          },
          settings: mockSettings,
        },
        mockSingleNotification,
      );
    });
  });

  describe('authentication methods', () => {
    const apiRequestAuthMock = jest.spyOn(apiRequests, 'apiRequestAuth');
    const fetchNotificationsMock = jest.fn();

    beforeEach(() => {
      (useNotifications as jest.Mock).mockReturnValue({
        fetchNotifications: fetchNotificationsMock,
      });
    });

    it('should call loginWithPersonalAccessToken', async () => {
      apiRequestAuthMock.mockResolvedValueOnce(null);

      const TestComponent = () => {
        const { loginWithPersonalAccessToken } = useContext(AppContext);

        return (
          <button
            type="button"
            onClick={() =>
              loginWithPersonalAccessToken({
                hostname: 'github.com' as Hostname,
                token: '123-456' as Token,
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

  describe('settings methods', () => {
    const fetchNotificationsMock = jest.fn();

    beforeEach(() => {
      (useNotifications as jest.Mock).mockReturnValue({
        fetchNotifications: fetchNotificationsMock,
      });
    });

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
        auth: {
          accounts: [],
          enterpriseAccounts: [],
          token: null,
          user: null,
        } as AuthState,
        settings: {
          participating: true,
          playSound: true,
          showNotifications: true,
          hideBots: false,
          showNotificationsCountInTray: false,
          openAtStartup: false,
          theme: 'SYSTEM',
          detailedNotifications: true,
          markAsDoneOnOpen: false,
          showAccountHeader: false,
          delayNotificationState: false,
          showPills: true,
          showNumber: true,
          keyboardShortcut: true,
          groupBy: 'REPOSITORY',
          filterReasons: [],
          zoomPercentage: 100,
          openLinks: 'FOREGROUND',
        } as SettingsState,
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
        auth: {
          accounts: [],
          enterpriseAccounts: [],
          token: null,
          user: null,
        } as AuthState,
        settings: {
          participating: false,
          playSound: true,
          showNotifications: true,
          hideBots: false,
          showNotificationsCountInTray: false,
          openAtStartup: true,
          theme: 'SYSTEM',
          detailedNotifications: true,
          markAsDoneOnOpen: false,
          showAccountHeader: false,
          delayNotificationState: false,
          showPills: true,
          showNumber: true,
          keyboardShortcut: true,
          groupBy: 'REPOSITORY',
          filterReasons: [],
          zoomPercentage: 100,
          openLinks: 'FOREGROUND',
        } as SettingsState,
      });
    });

    it('should clear filters back to default', async () => {
      const saveStateMock = jest
        .spyOn(storage, 'saveState')
        .mockImplementation(jest.fn());

      const TestComponent = () => {
        const { clearFilters } = useContext(AppContext);

        return (
          <button type="button" onClick={() => clearFilters()}>
            Test Case
          </button>
        );
      };

      const { getByText } = customRender(<TestComponent />);

      act(() => {
        fireEvent.click(getByText('Test Case'));
      });

      expect(saveStateMock).toHaveBeenCalledWith({
        auth: {
          accounts: [],
          enterpriseAccounts: [],
          token: null,
          user: null,
        } as AuthState,
        settings: {
          ...mockSettings,
          hideBots: defaultSettings.hideBots,
          filterReasons: defaultSettings.filterReasons,
        },
      });
    });

    it('should call resetSettings', async () => {
      const saveStateMock = jest
        .spyOn(storage, 'saveState')
        .mockImplementation(jest.fn());

      const TestComponent = () => {
        const { resetSettings } = useContext(AppContext);

        return (
          <button type="button" onClick={() => resetSettings()}>
            Test Case
          </button>
        );
      };

      const { getByText } = customRender(<TestComponent />);

      act(() => {
        fireEvent.click(getByText('Test Case'));
      });

      expect(saveStateMock).toHaveBeenCalledWith({
        auth: {
          accounts: [],
          enterpriseAccounts: [],
          token: null,
          user: null,
        } as AuthState,
        settings: defaultSettings,
      });
    });
  });
});
