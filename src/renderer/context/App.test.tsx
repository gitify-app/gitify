import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { useContext } from 'react';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mockAuth, mockSettings } from '../__mocks__/state-mocks';
import { Constants } from '../constants';
import { useNotifications } from '../hooks/useNotifications';
import type { AuthState, Hostname, SettingsState, Token } from '../types';
import { mockSingleNotification } from '../utils/api/__mocks__/response-mocks';
import * as apiRequests from '../utils/api/request';
import * as comms from '../utils/comms';
import * as notifications from '../utils/notifications/notifications';
import * as storage from '../utils/storage';
import { AppContext, AppProvider } from './App';
import { defaultSettings } from './defaults';

vi.mock('../hooks/useNotifications');

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

describe('renderer/context/App.tsx', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  describe('notification methods', () => {
    const getNotificationCountMock = vi.spyOn(
      notifications,
      'getNotificationCount',
    );
    getNotificationCountMock.mockReturnValue(1);

    const fetchNotificationsMock = vi.fn();
    const markNotificationsAsReadMock = vi.fn();
    const markNotificationsAsDoneMock = vi.fn();
    const unsubscribeNotificationMock = vi.fn();

    const mockDefaultState = {
      auth: { accounts: [] },
      settings: mockSettings,
    };

    beforeEach(() => {
      (useNotifications as vi.Mock).mockReturnValue({
        fetchNotifications: fetchNotificationsMock,
        markNotificationsAsRead: markNotificationsAsReadMock,
        markNotificationsAsDone: markNotificationsAsDoneMock,
        unsubscribeNotification: unsubscribeNotificationMock,
      });
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('fetch notifications every minute', async () => {
      customRender(null);

      // Wait for the useEffects, for settings.participating and accounts, to run.
      // Those aren't what we're testing
      await waitFor(() =>
        expect(fetchNotificationsMock).toHaveBeenCalledTimes(1),
      );

      act(() => {
        vi.advanceTimersByTime(Constants.FETCH_NOTIFICATIONS_INTERVAL_MS);
        return;
      });
      expect(fetchNotificationsMock).toHaveBeenCalledTimes(2);

      act(() => {
        vi.advanceTimersByTime(Constants.FETCH_NOTIFICATIONS_INTERVAL_MS);
        return;
      });
      expect(fetchNotificationsMock).toHaveBeenCalledTimes(3);

      act(() => {
        vi.advanceTimersByTime(Constants.FETCH_NOTIFICATIONS_INTERVAL_MS);
        return;
      });
      expect(fetchNotificationsMock).toHaveBeenCalledTimes(4);
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

      const { getByText } = customRender(<TestComponent />);

      fetchNotificationsMock.mockReset();

      fireEvent.click(getByText('Test Case'));

      expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);
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

      const { getByText } = customRender(<TestComponent />);

      fireEvent.click(getByText('Test Case'));

      expect(markNotificationsAsReadMock).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsReadMock).toHaveBeenCalledWith(
        mockDefaultState,
        [mockSingleNotification],
      );
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

      const { getByText } = customRender(<TestComponent />);

      fireEvent.click(getByText('Test Case'));

      expect(markNotificationsAsDoneMock).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsDoneMock).toHaveBeenCalledWith(
        mockDefaultState,
        [mockSingleNotification],
      );
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

      const { getByText } = customRender(<TestComponent />);

      fireEvent.click(getByText('Test Case'));

      expect(unsubscribeNotificationMock).toHaveBeenCalledTimes(1);
      expect(unsubscribeNotificationMock).toHaveBeenCalledWith(
        mockDefaultState,
        mockSingleNotification,
      );
    });
  });

  describe('authentication methods', () => {
    const apiRequestAuthMock = vi.spyOn(apiRequests, 'apiRequestAuth');
    const fetchNotificationsMock = vi.fn();

    beforeEach(() => {
      (useNotifications as vi.Mock).mockReturnValue({
        fetchNotifications: fetchNotificationsMock,
      });
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should call loginWithPersonalAccessToken', async () => {
      apiRequestAuthMock.mockResolvedValueOnce(null);

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

      const { getByText } = customRender(<TestComponent />);

      fireEvent.click(getByText('Test Case'));

      await waitFor(() =>
        expect(fetchNotificationsMock).toHaveBeenCalledTimes(1),
      );

      expect(apiRequestAuthMock).toHaveBeenCalledTimes(1);
      expect(apiRequestAuthMock).toHaveBeenCalledWith(
        'https://api.github.com/notifications',
        'HEAD',
        'encrypted',
      );
    });
  });

  describe('settings methods', () => {
    const fetchNotificationsMock = vi.fn();

    beforeEach(() => {
      (useNotifications as vi.Mock).mockReturnValue({
        fetchNotifications: fetchNotificationsMock,
      });
    });

    it('should call updateSetting', async () => {
      const saveStateMock = vi
        .spyOn(storage, 'saveState')
        .mockImplementation(vi.fn());

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

      const { getByText } = customRender(<TestComponent />);

      act(() => {
        fireEvent.click(getByText('Test Case'));
      });

      expect(saveStateMock).toHaveBeenCalledWith({
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
      const setAutoLaunchMock = vi.spyOn(comms, 'setAutoLaunch');
      const saveStateMock = vi
        .spyOn(storage, 'saveState')
        .mockImplementation(vi.fn());

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

      const { getByText } = customRender(<TestComponent />);

      act(() => {
        fireEvent.click(getByText('Test Case'));
      });

      expect(setAutoLaunchMock).toHaveBeenCalledWith(true);

      expect(saveStateMock).toHaveBeenCalledWith({
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
      const saveStateMock = vi
        .spyOn(storage, 'saveState')
        .mockImplementation(vi.fn());

      const TestComponent = () => {
        const { clearFilters } = useContext(AppContext);

        return (
          <button onClick={() => clearFilters()} type="button">
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
      const saveStateMock = vi
        .spyOn(storage, 'saveState')
        .mockImplementation(vi.fn());

      const TestComponent = () => {
        const { resetSettings } = useContext(AppContext);

        return (
          <button onClick={() => resetSettings()} type="button">
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
        } as AuthState,
        settings: defaultSettings,
      });
    });
  });
});
