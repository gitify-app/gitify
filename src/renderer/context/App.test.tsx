import { act } from '@testing-library/react';

import { renderWithProviders } from '../__helpers__/test-utils';
import { mockGitHubCloudAccount } from '../__mocks__/account-mocks';
import { mockGitifyNotification } from '../__mocks__/notifications-mocks';
import { mockSettings } from '../__mocks__/state-mocks';

import { Constants } from '../constants';

import { useAppContext } from '../hooks/useAppContext';
import { useNotifications } from '../hooks/useNotifications';

import type { AuthState, ClientID, ClientSecret, SettingsState, Token } from '../types';
import type { DeviceFlowSession } from '../utils/auth/types';

import * as authUtils from '../utils/auth/utils';
import * as storage from '../utils/core/storage';
import { getAdapter } from '../utils/forges/registry';
import * as notifications from '../utils/notifications/notifications';
import * as comms from '../utils/system/comms';
import * as tray from '../utils/system/tray';
import { AppProvider } from './App';
import { type AppContextState } from './context';
import { defaultSettings } from './defaults';

vi.mock('../hooks/useNotifications');

// Helper to render the context
const renderWithContext = () => {
  let context!: AppContextState;

  const CaptureContext = () => {
    context = useAppContext();
    return null;
  };

  renderWithProviders(
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
      globalError: undefined,
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
  });

  describe('notification methods', () => {
    const setTrayIconColorAndTitleSpy = vi
      .spyOn(tray, 'setTrayIconColorAndTitle')
      .mockImplementation(vi.fn());

    vi.spyOn(notifications, 'getNotificationCount').mockImplementation(vi.fn());

    vi.spyOn(notifications, 'getUnreadNotificationCount').mockImplementation(vi.fn());

    const mockDefaultState = {
      auth: { accounts: [] },
      settings: mockSettings,
    };

    it('fetch notifications each interval', async () => {
      renderWithProviders(<AppProvider>{null}</AppProvider>);

      // Initial fetch happens on mount - advance timers to ensure it runs
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(Constants.DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS);
      });
      expect(fetchNotificationsMock).toHaveBeenCalledTimes(2);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(Constants.DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS);
      });
      expect(fetchNotificationsMock).toHaveBeenCalledTimes(3);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(Constants.DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS);
      });
      expect(fetchNotificationsMock).toHaveBeenCalledTimes(4);
    });

    it('should call fetchNotifications', async () => {
      const getContext = renderWithContext();
      fetchNotificationsMock.mockReset();

      await act(async () => {
        getContext().fetchNotifications();
      });

      expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);
    });

    it('should call markNotificationsAsRead', async () => {
      const getContext = renderWithContext();

      await act(async () => {
        getContext().markNotificationsAsRead([mockGitifyNotification]);
      });

      expect(markNotificationsAsReadMock).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsReadMock).toHaveBeenCalledWith(mockDefaultState, [
        mockGitifyNotification,
      ]);
      expect(setTrayIconColorAndTitleSpy).toHaveBeenCalledTimes(1);
    });

    it('should call markNotificationsAsDone', async () => {
      const getContext = renderWithContext();

      await act(async () => {
        getContext().markNotificationsAsDone([mockGitifyNotification]);
      });

      expect(markNotificationsAsDoneMock).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsDoneMock).toHaveBeenCalledWith(mockDefaultState, [
        mockGitifyNotification,
      ]);
      expect(setTrayIconColorAndTitleSpy).toHaveBeenCalledTimes(1);
    });

    it('should call unsubscribeNotification', async () => {
      const getContext = renderWithContext();

      await act(async () => {
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
    const saveStateSpy = vi.spyOn(storage, 'saveState').mockImplementation(vi.fn());

    it('should call updateSetting', async () => {
      const getContext = renderWithContext();

      await act(async () => {
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

    it('loginWithDeviceFlowStart delegates to the forge adapter', async () => {
      const adapter = getAdapter('github');
      const startSpy = vi.spyOn(adapter.deviceFlow!, 'start').mockImplementation(vi.fn());

      const getContext = renderWithContext();

      await act(async () => {
        getContext().loginWithDeviceFlowStart('github');
      });

      expect(startSpy).toHaveBeenCalled();
    });

    it('loginWithDeviceFlowPoll delegates to the forge adapter', async () => {
      const adapter = getAdapter('github');
      const pollSpy = vi.spyOn(adapter.deviceFlow!, 'poll').mockImplementation(vi.fn());

      const getContext = renderWithContext();

      await act(async () => {
        getContext().loginWithDeviceFlowPoll('github', 'session' as unknown as DeviceFlowSession);
      });

      expect(pollSpy).toHaveBeenCalledWith('session');
    });

    it('loginWithDeviceFlowComplete calls addAccount', async () => {
      const getContext = renderWithContext();

      await act(async () => {
        await getContext().loginWithDeviceFlowComplete(
          'github',
          'token' as Token,
          Constants.GITHUB_HOSTNAME,
        );
      });

      expect(addAccountSpy).toHaveBeenCalledWith(
        expect.anything(),
        'GitHub App',
        'token',
        'github.com',
        'github',
      );
    });

    it('loginWithOAuthApp delegates to the forge adapter', async () => {
      const adapter = getAdapter('github');
      const oauthSpy = vi.spyOn(adapter.oauthWebApp!, 'performWebOAuth');

      const getContext = renderWithContext();

      await act(async () => {
        getContext().loginWithOAuthApp('github', {
          clientId: 'id' as ClientID,
          clientSecret: 'secret' as ClientSecret,
          hostname: Constants.GITHUB_HOSTNAME,
        });
      });

      expect(oauthSpy).toHaveBeenCalled();
    });

    it('loginWithDeviceFlowStart throws when the forge does not support device flow', async () => {
      const getContext = renderWithContext();

      await expect(getContext().loginWithDeviceFlowStart('gitea')).rejects.toThrow(
        /Device flow is not supported for forge "gitea"/,
      );
    });

    it('loginWithDeviceFlowPoll throws when the forge does not support device flow', async () => {
      const getContext = renderWithContext();

      await expect(
        getContext().loginWithDeviceFlowPoll('gitea', {} as DeviceFlowSession),
      ).rejects.toThrow(/Device flow is not supported for forge "gitea"/);
    });

    it('loginWithDeviceFlowComplete throws when the forge does not support device flow', async () => {
      const getContext = renderWithContext();

      await expect(
        getContext().loginWithDeviceFlowComplete(
          'gitea',
          'token' as Token,
          Constants.GITHUB_HOSTNAME,
        ),
      ).rejects.toThrow(/does not support device flow/);
    });

    it('loginWithOAuthApp throws when the forge does not support OAuth app login', async () => {
      const getContext = renderWithContext();

      await expect(
        getContext().loginWithOAuthApp('gitea', {
          clientId: 'id' as ClientID,
          clientSecret: 'secret' as ClientSecret,
          hostname: Constants.GITHUB_HOSTNAME,
        }),
      ).rejects.toThrow(/OAuth app login is not supported for forge "gitea"/);
    });

    it('logoutFromAccount calls removeAccountNotifications, removeAccount', async () => {
      const getContext = renderWithContext();

      await act(async () => {
        getContext().logoutFromAccount(mockGitHubCloudAccount);
      });

      expect(removeAccountNotificationsMock).toHaveBeenCalledWith(mockGitHubCloudAccount);
      expect(removeAccountSpy).toHaveBeenCalledWith(expect.anything(), mockGitHubCloudAccount);
    });
  });

  describe('migrateAuthTokens (startup)', () => {
    const refreshAccountSpy = vi
      .spyOn(authUtils, 'refreshAccount')
      .mockImplementation(async (account) => account);
    const decryptValueSpy = vi.spyOn(comms, 'decryptValue');
    const encryptValueSpy = vi.spyOn(comms, 'encryptValue');
    const saveStateSpy = vi.spyOn(storage, 'saveState').mockImplementation(vi.fn());
    const loadStateSpy = vi.spyOn(storage, 'loadState');

    beforeEach(() => {
      vi.useRealTimers();
      saveStateSpy.mockClear();
      decryptValueSpy.mockReset();
      encryptValueSpy.mockReset();
      refreshAccountSpy.mockClear();
    });

    afterEach(() => {
      vi.useFakeTimers();
    });

    it('persists rotated ciphertext when decryptValue reports a re-encryption', async () => {
      loadStateSpy.mockReturnValue({
        auth: { accounts: [mockGitHubCloudAccount] } as AuthState,
        settings: mockSettings,
      });
      decryptValueSpy.mockResolvedValue({
        token: 'plain-token',
        reEncryptedToken: 'rotated-cipher',
      });

      await act(async () => {
        renderWithProviders(<AppProvider>{null}</AppProvider>);
      });

      const persistCall = saveStateSpy.mock.calls.find(
        ([state]) => (state as { auth: AuthState }).auth.accounts[0]?.token === 'rotated-cipher',
      );
      expect(persistCall).toBeDefined();
    });

    it('does not persist when decryptValue returns no rotated ciphertext', async () => {
      loadStateSpy.mockReturnValue({
        auth: { accounts: [mockGitHubCloudAccount] } as AuthState,
        settings: mockSettings,
      });
      decryptValueSpy.mockResolvedValue({ token: 'plain-token' });

      await act(async () => {
        renderWithProviders(<AppProvider>{null}</AppProvider>);
      });

      const tokenChanged = saveStateSpy.mock.calls.some(
        ([state]) =>
          (state as { auth: AuthState }).auth.accounts[0]?.token !== mockGitHubCloudAccount.token,
      );
      expect(tokenChanged).toBe(false);
    });

    it('re-encrypts plaintext token (legacy migration) when decrypt throws', async () => {
      loadStateSpy.mockReturnValue({
        auth: { accounts: [mockGitHubCloudAccount] } as AuthState,
        settings: mockSettings,
      });
      decryptValueSpy.mockRejectedValue(new Error('not encrypted'));
      encryptValueSpy.mockResolvedValue('newly-encrypted');

      await act(async () => {
        renderWithProviders(<AppProvider>{null}</AppProvider>);
      });

      expect(encryptValueSpy).toHaveBeenCalledWith(mockGitHubCloudAccount.token);
      const persistCall = saveStateSpy.mock.calls.find(
        ([state]) => (state as { auth: AuthState }).auth.accounts[0]?.token === 'newly-encrypted',
      );
      expect(persistCall).toBeDefined();
    });
  });
});
