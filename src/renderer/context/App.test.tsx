import { act, fireEvent, waitFor } from '@testing-library/react';
import { useContext } from 'react';

import { renderWithAppContext } from '../__helpers__/test-utils';
import { mockSettings } from '../__mocks__/state-mocks';
import { Constants } from '../constants';
import { useNotifications } from '../hooks/useNotifications';
import type { AuthState, Hostname, SettingsState, Token } from '../types';
import { mockSingleNotification } from '../utils/api/__mocks__/response-mocks';
import * as apiRequests from '../utils/api/request';
import * as comms from '../utils/comms';
import * as notifications from '../utils/notifications/notifications';
import * as storage from '../utils/storage';
import * as tray from '../utils/tray';
import { AppContext, AppProvider } from './App';
import { defaultSettings } from './defaults';

jest.mock('../hooks/useNotifications');

describe('renderer/context/App.tsx', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  describe('notification methods', () => {
    const mockSetTrayIconColorAndTitle = jest
      .spyOn(tray, 'setTrayIconColorAndTitle')
      .mockImplementation(jest.fn());

    jest
      .spyOn(notifications, 'getNotificationCount')
      .mockImplementation(jest.fn());

    jest
      .spyOn(notifications, 'getUnreadNotificationCount')
      .mockImplementation(jest.fn());

    const mockFetchNotifications = jest.fn();
    const mockMarkNotificationsAsRead = jest.fn();
    const mockMarkNotificationsAsDone = jest.fn();
    const mockUnsubscribeNotification = jest.fn();

    const mockDefaultState = {
      auth: { accounts: [] },
      settings: mockSettings,
    };

    beforeEach(() => {
      (useNotifications as jest.Mock).mockReturnValue({
        fetchNotifications: mockFetchNotifications,
        markNotificationsAsRead: mockMarkNotificationsAsRead,
        markNotificationsAsDone: mockMarkNotificationsAsDone,
        unsubscribeNotification: mockUnsubscribeNotification,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('fetch notifications every minute', async () => {
      renderWithAppContext(<AppProvider>{null}</AppProvider>);

      await waitFor(() =>
        expect(mockFetchNotifications).toHaveBeenCalledTimes(1),
      );

      act(() => {
        jest.advanceTimersByTime(
          Constants.DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS,
        );
      });
      expect(mockFetchNotifications).toHaveBeenCalledTimes(2);

      act(() => {
        jest.advanceTimersByTime(
          Constants.DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS,
        );
      });
      expect(mockFetchNotifications).toHaveBeenCalledTimes(3);

      act(() => {
        jest.advanceTimersByTime(
          Constants.DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS,
        );
      });
      expect(mockFetchNotifications).toHaveBeenCalledTimes(4);
    });

    it('should call fetchNotifications', async () => {
      const TestComponent = () => {
        const { fetchNotifications } = useContext(AppContext);

        return (
          <button onClick={fetchNotifications} type="button">
            Test Case
          </button>
        );
      };

      const { getByText } = renderWithAppContext(
        <AppProvider>
          <TestComponent />
        </AppProvider>,
      );

      mockFetchNotifications.mockReset();

      fireEvent.click(getByText('Test Case'));

      expect(mockFetchNotifications).toHaveBeenCalledTimes(1);
    });

    it('should call markNotificationsAsRead', async () => {
      const TestComponent = () => {
        const { markNotificationsAsRead } = useContext(AppContext);

        return (
          <button
            onClick={() => markNotificationsAsRead([mockSingleNotification])}
            type="button"
          >
            Test Case
          </button>
        );
      };

      const { getByText } = renderWithAppContext(
        <AppProvider>
          <TestComponent />
        </AppProvider>,
      );

      fireEvent.click(getByText('Test Case'));

      expect(mockMarkNotificationsAsRead).toHaveBeenCalledTimes(1);
      expect(mockMarkNotificationsAsRead).toHaveBeenCalledWith(
        mockDefaultState,
        [mockSingleNotification],
      );
      expect(mockSetTrayIconColorAndTitle).toHaveBeenCalledTimes(1);
    });

    it('should call markNotificationsAsDone', async () => {
      const TestComponent = () => {
        const { markNotificationsAsDone } = useContext(AppContext);

        return (
          <button
            onClick={() => markNotificationsAsDone([mockSingleNotification])}
            type="button"
          >
            Test Case
          </button>
        );
      };

      const { getByText } = renderWithAppContext(
        <AppProvider>
          <TestComponent />
        </AppProvider>,
      );

      fireEvent.click(getByText('Test Case'));

      expect(mockMarkNotificationsAsDone).toHaveBeenCalledTimes(1);
      expect(mockMarkNotificationsAsDone).toHaveBeenCalledWith(
        mockDefaultState,
        [mockSingleNotification],
      );
      expect(mockSetTrayIconColorAndTitle).toHaveBeenCalledTimes(1);
    });

    it('should call unsubscribeNotification', async () => {
      const TestComponent = () => {
        const { unsubscribeNotification } = useContext(AppContext);

        return (
          <button
            onClick={() => unsubscribeNotification(mockSingleNotification)}
            type="button"
          >
            Test Case
          </button>
        );
      };

      const { getByText } = renderWithAppContext(
        <AppProvider>
          <TestComponent />
        </AppProvider>,
      );

      fireEvent.click(getByText('Test Case'));

      expect(mockUnsubscribeNotification).toHaveBeenCalledTimes(1);
      expect(mockUnsubscribeNotification).toHaveBeenCalledWith(
        mockDefaultState,
        mockSingleNotification,
      );
      expect(mockSetTrayIconColorAndTitle).toHaveBeenCalledTimes(1);
    });
  });

  describe('authentication methods', () => {
    const mockApiRequestAuth = jest.spyOn(apiRequests, 'apiRequestAuth');
    const mockFetchNotifications = jest.fn();

    beforeEach(() => {
      (useNotifications as jest.Mock).mockReturnValue({
        fetchNotifications: mockFetchNotifications,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call loginWithPersonalAccessToken', async () => {
      mockApiRequestAuth.mockResolvedValueOnce(null);

      const TestComponent = () => {
        const { loginWithPersonalAccessToken } = useContext(AppContext);

        return (
          <button
            onClick={() =>
              loginWithPersonalAccessToken({
                hostname: 'github.com' as Hostname,
                token: '123-456' as Token,
              })
            }
            type="button"
          >
            Test Case
          </button>
        );
      };

      const { getByText } = renderWithAppContext(
        <AppProvider>
          <TestComponent />
        </AppProvider>,
      );

      fireEvent.click(getByText('Test Case'));

      await waitFor(() =>
        expect(mockFetchNotifications).toHaveBeenCalledTimes(1),
      );

      expect(mockApiRequestAuth).toHaveBeenCalledTimes(1);
      expect(mockApiRequestAuth).toHaveBeenCalledWith(
        'https://api.github.com/notifications',
        'HEAD',
        'encrypted',
      );
    });
  });

  describe('settings methods', () => {
    const mockFetchNotifications = jest.fn();

    beforeEach(() => {
      (useNotifications as jest.Mock).mockReturnValue({
        fetchNotifications: mockFetchNotifications,
      });
    });

    it('should call updateSetting', async () => {
      const mockSaveState = jest
        .spyOn(storage, 'saveState')
        .mockImplementation(jest.fn());

      const TestComponent = () => {
        const { updateSetting } = useContext(AppContext);

        return (
          <button
            onClick={() => updateSetting('participating', true)}
            type="button"
          >
            Test Case
          </button>
        );
      };

      const { getByText } = renderWithAppContext(
        <AppProvider>
          <TestComponent />
        </AppProvider>,
      );

      act(() => {
        fireEvent.click(getByText('Test Case'));
      });

      expect(mockSaveState).toHaveBeenCalledWith({
        auth: {
          accounts: [],
        } as AuthState,
        settings: {
          ...defaultSettings,
          participating: true,
        } as SettingsState,
      });
    });

    it('should call updateSetting and set auto launch(openAtStartup)', async () => {
      const mockSetAutoLaunch = jest.spyOn(comms, 'setAutoLaunch');
      const mockSaveState = jest
        .spyOn(storage, 'saveState')
        .mockImplementation(jest.fn());

      const TestComponent = () => {
        const { updateSetting } = useContext(AppContext);

        return (
          <button
            onClick={() => updateSetting('openAtStartup', true)}
            type="button"
          >
            Test Case
          </button>
        );
      };

      const { getByText } = renderWithAppContext(
        <AppProvider>
          <TestComponent />
        </AppProvider>,
      );

      act(() => {
        fireEvent.click(getByText('Test Case'));
      });

      expect(mockSetAutoLaunch).toHaveBeenCalledWith(true);

      expect(mockSaveState).toHaveBeenCalledWith({
        auth: {
          accounts: [],
        } as AuthState,
        settings: {
          ...defaultSettings,
          openAtStartup: true,
        } as SettingsState,
      });
    });

    it('should clear filters back to default', async () => {
      const mockSaveState = jest
        .spyOn(storage, 'saveState')
        .mockImplementation(jest.fn());

      const TestComponent = () => {
        const { clearFilters } = useContext(AppContext);

        return (
          <button onClick={() => clearFilters()} type="button">
            Test Case
          </button>
        );
      };

      const { getByText } = renderWithAppContext(
        <AppProvider>
          <TestComponent />
        </AppProvider>,
      );

      act(() => {
        fireEvent.click(getByText('Test Case'));
      });

      expect(mockSaveState).toHaveBeenCalledWith({
        auth: {
          accounts: [],
        } as AuthState,
        settings: {
          ...mockSettings,
          filterIncludeSearchTokens: defaultSettings.filterIncludeSearchTokens,
          filterExcludeSearchTokens: defaultSettings.filterExcludeSearchTokens,
          filterUserTypes: defaultSettings.filterUserTypes,
          filterSubjectTypes: defaultSettings.filterSubjectTypes,
          filterStates: defaultSettings.filterStates,
          filterReasons: defaultSettings.filterReasons,
        },
      });
    });

    it('should call resetSettings', async () => {
      const mockSaveState = jest
        .spyOn(storage, 'saveState')
        .mockImplementation(jest.fn());

      const TestComponent = () => {
        const { resetSettings } = useContext(AppContext);

        return (
          <button onClick={() => resetSettings()} type="button">
            Test Case
          </button>
        );
      };

      const { getByText } = renderWithAppContext(
        <AppProvider>
          <TestComponent />
        </AppProvider>,
      );

      act(() => {
        fireEvent.click(getByText('Test Case'));
      });

      expect(mockSaveState).toHaveBeenCalledWith({
        auth: {
          accounts: [],
        } as AuthState,
        settings: defaultSettings,
      });
    });
  });
});
