import { act, waitFor } from '@testing-library/react';

import { renderWithAppContext } from '../__helpers__/test-utils';
import { mockGitHubCloudAccount } from '../__mocks__/account-mocks';
import { mockGitifyNotification } from '../__mocks__/notifications-mocks';
import { mockSettings } from '../__mocks__/state-mocks';

import { Constants } from '../constants';

import { useAppContext } from '../hooks/useAppContext';
import { useNotifications } from '../hooks/useNotifications';

import type {
  AuthState,
  ClientID,
  ClientSecret,
  Hostname,
  SettingsState,
  Token,
} from '../types';
import type { DeviceFlowSession } from '../utils/auth/types';

import * as authUtils from '../utils/auth/utils';
import * as notifications from '../utils/notifications/notifications';
import * as storage from '../utils/storage';
import * as tray from '../utils/tray';
import { type AppContextState, AppProvider } from './App';
import { defaultSettings } from './defaults';

jest.mock('../hooks/useNotifications');

// Helper to render the context
const renderWithContext = () => {
  let context!: AppContextState;

  const CaptureContext = () => {
    context = useAppContext();
    return null;
  };

  renderWithAppContext(
    <AppProvider>
      <CaptureContext />
    </AppProvider>,
  );

  return () => context;
};

describe('renderer/context/App.tsx', () => {
  const fetchNotificationsMock = jest.fn();
  const markNotificationsAsReadMock = jest.fn();
  const markNotificationsAsDoneMock = jest.fn();
  const unsubscribeNotificationMock = jest.fn();
  const removeAccountNotificationsMock = jest.fn();

  const saveStateSpy = jest
    .spyOn(storage, 'saveState')
    .mockImplementation(jest.fn());

  beforeEach(() => {
    jest.useFakeTimers();
    (useNotifications as jest.Mock).mockReturnValue({
      fetchNotifications: fetchNotificationsMock,
      markNotificationsAsRead: markNotificationsAsReadMock,
      markNotificationsAsDone: markNotificationsAsDoneMock,
      unsubscribeNotification: unsubscribeNotificationMock,
      removeAccountNotifications: removeAccountNotificationsMock,
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  describe('notification methods', () => {
    const setTrayIconColorAndTitleSpy = jest
      .spyOn(tray, 'setTrayIconColorAndTitle')
      .mockImplementation(jest.fn());

    jest
      .spyOn(notifications, 'getNotificationCount')
      .mockImplementation(jest.fn());

    jest
      .spyOn(notifications, 'getUnreadNotificationCount')
      .mockImplementation(jest.fn());

    const mockDefaultState = {
      auth: { accounts: [] },
      settings: mockSettings,
    };

    it('fetch notifications each interval', async () => {
      renderWithAppContext(<AppProvider>{null}</AppProvider>);

      await waitFor(() =>
        expect(fetchNotificationsMock).toHaveBeenCalledTimes(1),
      );

      act(() => {
        jest.advanceTimersByTime(
          Constants.DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS,
        );
      });
      expect(fetchNotificationsMock).toHaveBeenCalledTimes(2);

      act(() => {
        jest.advanceTimersByTime(
          Constants.DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS,
        );
      });
      expect(fetchNotificationsMock).toHaveBeenCalledTimes(3);

      act(() => {
        jest.advanceTimersByTime(
          Constants.DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS,
        );
      });
      expect(fetchNotificationsMock).toHaveBeenCalledTimes(4);
    });

    it('should call fetchNotifications', async () => {
      const getContext = renderWithContext();
      fetchNotificationsMock.mockReset();

      act(() => {
        getContext().fetchNotifications();
      });

      expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);
    });

    it('should call markNotificationsAsRead', async () => {
      const getContext = renderWithContext();

      act(() => {
        getContext().markNotificationsAsRead([mockGitifyNotification]);
      });

      expect(markNotificationsAsReadMock).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsReadMock).toHaveBeenCalledWith(
        mockDefaultState,
        [mockGitifyNotification],
      );
      expect(setTrayIconColorAndTitleSpy).toHaveBeenCalledTimes(1);
    });

    it('should call markNotificationsAsDone', async () => {
      const getContext = renderWithContext();

      act(() => {
        getContext().markNotificationsAsDone([mockGitifyNotification]);
      });

      expect(markNotificationsAsDoneMock).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsDoneMock).toHaveBeenCalledWith(
        mockDefaultState,
        [mockGitifyNotification],
      );
      expect(setTrayIconColorAndTitleSpy).toHaveBeenCalledTimes(1);
    });

    it('should call unsubscribeNotification', async () => {
      const getContext = renderWithContext();

      act(() => {
        getContext().unsubscribeNotification(mockGitifyNotification);
      });

      expect(unsubscribeNotificationMock).toHaveBeenCalledTimes(1);
      expect(unsubscribeNotificationMock).toHaveBeenCalledWith(
        mockDefaultState,
        mockGitifyNotification,
      );
      expect(setTrayIconColorAndTitleSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('settings methods', () => {
    const saveStateSpy = jest
      .spyOn(storage, 'saveState')
      .mockImplementation(jest.fn());

    it('should call updateSetting', async () => {
      const getContext = renderWithContext();

      act(() => {
        getContext().updateSetting('participating', true);
      });

      expect(saveStateSpy).toHaveBeenCalledWith({
        auth: {
          accounts: [],
        } as AuthState,
        settings: {
          ...defaultSettings,
          participating: true,
        } as SettingsState,
      });
    });

    it('should call resetSettings', async () => {
      const getContext = renderWithContext();

      act(() => {
        getContext().resetSettings();
      });

      expect(saveStateSpy).toHaveBeenCalledWith({
        auth: {
          accounts: [],
        } as AuthState,
        settings: defaultSettings,
      });
    });
  });

  describe('filter methods', () => {
    it('should call updateFilter - checked', async () => {
      const getContext = renderWithContext();

      act(() => {
        getContext().updateFilter('filterReasons', 'assign', true);
      });

      expect(saveStateSpy).toHaveBeenCalledWith({
        auth: {
          accounts: [],
        } as AuthState,
        settings: {
          ...defaultSettings,
          filterReasons: ['assign'],
        } as SettingsState,
      });
    });

    it('should call updateFilter - unchecked', async () => {
      const getContext = renderWithContext();

      act(() => {
        getContext().updateFilter('filterReasons', 'assign', false);
      });

      expect(saveStateSpy).toHaveBeenCalledWith({
        auth: {
          accounts: [],
        } as AuthState,
        settings: {
          ...defaultSettings,
          filterReasons: [],
        } as SettingsState,
      });
    });

    it('should clear filters back to default', async () => {
      const getContext = renderWithContext();

      act(() => {
        getContext().clearFilters();
      });

      expect(saveStateSpy).toHaveBeenCalledWith({
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
  });

  describe('authentication functions', () => {
    const addAccountSpy = jest
      .spyOn(authUtils, 'addAccount')
      .mockImplementation(jest.fn());
    const removeAccountSpy = jest.spyOn(authUtils, 'removeAccount');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('loginWithDeviceFlowStart calls startGitHubDeviceFlow', async () => {
      const startGitHubDeviceFlowSpy = jest
        .spyOn(authUtils, 'startGitHubDeviceFlow')
        .mockImplementation(jest.fn());

      const getContext = renderWithContext();

      act(() => {
        getContext().loginWithDeviceFlowStart();
      });

      expect(startGitHubDeviceFlowSpy).toHaveBeenCalled();
    });

    it('loginWithDeviceFlowPoll calls pollGitHubDeviceFlow', async () => {
      const pollGitHubDeviceFlowSpy = jest
        .spyOn(authUtils, 'pollGitHubDeviceFlow')
        .mockImplementation(jest.fn());

      const getContext = renderWithContext();

      act(() => {
        getContext().loginWithDeviceFlowPoll(
          'session' as unknown as DeviceFlowSession,
        );
      });

      expect(pollGitHubDeviceFlowSpy).toHaveBeenCalledWith('session');
    });

    it('loginWithDeviceFlowComplete calls addAccount', async () => {
      const getContext = renderWithContext();

      act(() => {
        getContext().loginWithDeviceFlowComplete(
          'token' as Token,
          'github.com' as Hostname,
        );
      });

      expect(addAccountSpy).toHaveBeenCalledWith(
        expect.anything(),
        'GitHub App',
        'token',
        'github.com',
      );
    });

    it('loginWithOAuthApp calls performGitHubWebOAuth', async () => {
      const performGitHubWebOAuthSpy = jest.spyOn(
        authUtils,
        'performGitHubWebOAuth',
      );

      const getContext = renderWithContext();

      act(() => {
        getContext().loginWithOAuthApp({
          clientId: 'id' as ClientID,
          clientSecret: 'secret' as ClientSecret,
          hostname: 'github.com' as Hostname,
        });
      });

      expect(performGitHubWebOAuthSpy).toHaveBeenCalled();
    });

    it('logoutFromAccount calls removeAccountNotifications, removeAccount', async () => {
      const getContext = renderWithContext();

      getContext().logoutFromAccount(mockGitHubCloudAccount);

      expect(removeAccountNotificationsMock).toHaveBeenCalledWith(
        mockGitHubCloudAccount,
      );
      expect(removeAccountSpy).toHaveBeenCalledWith(
        expect.anything(),
        mockGitHubCloudAccount,
      );
    });
  });
});
