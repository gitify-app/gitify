import { act } from '@testing-library/react';

import { renderWithAppContext } from '../__helpers__/test-utils';
import { mockGitifyNotification } from '../__mocks__/notifications-mocks';

import { Constants } from '../constants';

import { useAppContext } from '../hooks/useAppContext';
import { useNotifications } from '../hooks/useNotifications';
import { useAccountsStore } from '../stores';

import type { ClientID, ClientSecret, Token } from '../types';
import type { DeviceFlowSession } from '../utils/auth/types';

import * as authUtils from '../utils/auth/utils';
import * as notifications from '../utils/notifications/notifications';
import * as tray from '../utils/tray';
import { type AppContextState, AppProvider } from './App';

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
  const refetchNotificationsMock = vi.fn();
  const markNotificationsAsReadMock = vi.fn();
  const markNotificationsAsDoneMock = vi.fn();
  const unsubscribeNotificationMock = vi.fn();

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
      refetchNotifications: refetchNotificationsMock,
      markNotificationsAsRead: markNotificationsAsReadMock,
      markNotificationsAsDone: markNotificationsAsDoneMock,
      unsubscribeNotification: unsubscribeNotificationMock,
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

    it('should call fetchNotifications', async () => {
      const getContext = renderWithContext();
      refetchNotificationsMock.mockReset();

      act(() => {
        getContext().fetchNotifications();
      });

      expect(refetchNotificationsMock).toHaveBeenCalledTimes(1);
    });

    it('should call markNotificationsAsRead', async () => {
      const getContext = renderWithContext();

      act(() => {
        getContext().markNotificationsAsRead([mockGitifyNotification]);
      });

      expect(markNotificationsAsReadMock).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsReadMock).toHaveBeenCalledWith([
        mockGitifyNotification,
      ]);
      expect(setTrayIconColorAndTitleSpy).toHaveBeenCalledTimes(1);
    });

    it('should call markNotificationsAsDone', async () => {
      const getContext = renderWithContext();

      act(() => {
        getContext().markNotificationsAsDone([mockGitifyNotification]);
      });

      expect(markNotificationsAsDoneMock).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsDoneMock).toHaveBeenCalledWith([
        mockGitifyNotification,
      ]);
      expect(setTrayIconColorAndTitleSpy).toHaveBeenCalledTimes(1);
    });

    it('should call unsubscribeNotification', async () => {
      const getContext = renderWithContext();

      act(() => {
        getContext().unsubscribeNotification(mockGitifyNotification);
      });

      expect(unsubscribeNotificationMock).toHaveBeenCalledTimes(1);
      expect(unsubscribeNotificationMock).toHaveBeenCalledWith(
        mockGitifyNotification,
      );
      expect(setTrayIconColorAndTitleSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('authentication functions', () => {
    let createAccountSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(async () => {
      createAccountSpy = vi.spyOn(useAccountsStore.getState(), 'createAccount');
    });

    afterEach(() => {
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

      expect(createAccountSpy).toHaveBeenCalledWith(
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
  });
});
