import { act } from '@testing-library/react';

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

vi.mock('../hooks/useNotifications');

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
  const fetchNotificationsMock = vi.fn();
  const markNotificationsAsReadMock = vi.fn();
  const markNotificationsAsDoneMock = vi.fn();
  const unsubscribeNotificationMock = vi.fn();
  const removeAccountNotificationsMock = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(useNotifications).mockReturnValue({
      status: 'success',
      globalError: null,
      notifications: [],
      notificationCount: 0,
      hasNotifications: false,
      unreadNotificationCount: 0,
      hasUnreadNotifications: false,
      fetchNotifications: fetchNotificationsMock,
      markNotificationsAsRead: markNotificationsAsReadMock,
      markNotificationsAsDone: markNotificationsAsDoneMock,
      unsubscribeNotification: unsubscribeNotificationMock,
      removeAccountNotifications: removeAccountNotificationsMock,
    } as ReturnType<typeof useNotifications>);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  describe('notification methods', () => {
    const setTrayIconColorAndTitleSpy = vi
      .spyOn(tray, 'setTrayIconColorAndTitle')
      .mockImplementation(vi.fn());

    vi.spyOn(notifications, 'getNotificationCount').mockImplementation(vi.fn());

    vi.spyOn(notifications, 'getUnreadNotificationCount').mockImplementation(
      vi.fn(),
    );

    const mockDefaultState = {
      auth: { accounts: [] },
      settings: mockSettings,
    };

    it('fetch notifications each interval', async () => {
      renderWithAppContext(<AppProvider>{null}</AppProvider>);

      // Initial fetch happens on mount - advance timers to ensure it runs
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(
          Constants.DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS,
        );
      });
      expect(fetchNotificationsMock).toHaveBeenCalledTimes(2);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(
          Constants.DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS,
        );
      });
      expect(fetchNotificationsMock).toHaveBeenCalledTimes(3);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(
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
    const saveStateSpy = vi
      .spyOn(storage, 'saveState')
      .mockImplementation(vi.fn());

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

  describe('authentication functions', () => {
    const addAccountSpy = vi
      .spyOn(authUtils, 'addAccount')
      .mockImplementation(vi.fn())
      .mockResolvedValueOnce({
        accounts: [mockGitHubCloudAccount],
      } as unknown as AuthState);
    const removeAccountSpy = vi.spyOn(authUtils, 'removeAccount');

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('loginWithDeviceFlowStart calls startGitHubDeviceFlow', async () => {
      const startGitHubDeviceFlowSpy = vi
        .spyOn(authUtils, 'startGitHubDeviceFlow')
        .mockImplementation(vi.fn());

      const getContext = renderWithContext();

      act(() => {
        getContext().loginWithDeviceFlowStart();
      });

      expect(startGitHubDeviceFlowSpy).toHaveBeenCalled();
    });

    it('loginWithDeviceFlowPoll calls pollGitHubDeviceFlow', async () => {
      const pollGitHubDeviceFlowSpy = vi
        .spyOn(authUtils, 'pollGitHubDeviceFlow')
        .mockImplementation(vi.fn());

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

      await act(async () => {
        await getContext().loginWithDeviceFlowComplete(
          'token' as Token,
          Constants.GITHUB_HOSTNAME,
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
      const performGitHubWebOAuthSpy = vi.spyOn(
        authUtils,
        'performGitHubWebOAuth',
      );

      const getContext = renderWithContext();

      act(() => {
        getContext().loginWithOAuthApp({
          clientId: 'id' as ClientID,
          clientSecret: 'secret' as ClientSecret,
          hostname: Constants.GITHUB_HOSTNAME,
        });
      });

      expect(performGitHubWebOAuthSpy).toHaveBeenCalled();
    });

    it('logoutFromAccount calls removeAccountNotifications, removeAccount', async () => {
      const getContext = renderWithContext();

      act(() => {
        getContext().logoutFromAccount(mockGitHubCloudAccount);
      });

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
