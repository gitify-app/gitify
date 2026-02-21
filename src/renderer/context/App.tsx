import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useTheme } from '@primer/react';

import { onlineManager } from '@tanstack/react-query';

import { useAccounts } from '../hooks/useAccounts';
import { useNotifications } from '../hooks/useNotifications';
import { useAccountsStore, useFiltersStore, useSettingsStore } from '../stores';

import type {
  Account,
  AccountNotifications,
  GitifyError,
  GitifyNotification,
  Hostname,
  Status,
  Token,
} from '../types';
import type {
  DeviceFlowSession,
  LoginOAuthWebOptions,
  LoginPersonalAccessTokenOptions,
} from '../utils/auth/types';

import { fetchAuthenticatedUserDetails } from '../utils/api/client';
import { clearOctokitClientCache } from '../utils/api/octokit';
import {
  exchangeAuthCodeForAccessToken,
  performGitHubWebOAuth,
  pollGitHubDeviceFlow,
  startGitHubDeviceFlow,
} from '../utils/auth/utils';
import { encryptValue } from '../utils/comms';
import {
  DEFAULT_DAY_COLOR_SCHEME,
  DEFAULT_DAY_HIGH_CONTRAST_COLOR_SCHEME,
  DEFAULT_NIGHT_COLOR_SCHEME,
  DEFAULT_NIGHT_HIGH_CONTRAST_COLOR_SCHEME,
  mapThemeModeToColorMode,
  mapThemeModeToColorScheme,
} from '../utils/theme';
import { setTrayIconColorAndTitle } from '../utils/tray';

export interface AppContextState {
  status: Status;
  globalError: GitifyError;

  loginWithDeviceFlowStart: () => Promise<DeviceFlowSession>;
  loginWithDeviceFlowPoll: (
    session: DeviceFlowSession,
  ) => Promise<Token | null>;
  loginWithDeviceFlowComplete: (
    token: Token,
    hostname: Hostname,
  ) => Promise<void>;
  loginWithOAuthApp: (data: LoginOAuthWebOptions) => Promise<void>;
  loginWithPersonalAccessToken: (
    data: LoginPersonalAccessTokenOptions,
  ) => Promise<void>;

  notifications: AccountNotifications[];
  notificationCount: number;
  unreadNotificationCount: number;
  hasNotifications: boolean;
  hasUnreadNotifications: boolean;

  fetchNotifications: () => Promise<void>;

  markNotificationsAsRead: (
    notifications: GitifyNotification[],
  ) => Promise<void>;
  markNotificationsAsDone: (
    notifications: GitifyNotification[],
  ) => Promise<void>;
  unsubscribeNotification: (notification: GitifyNotification) => Promise<void>;

  isOnline: boolean;
}

export const AppContext = createContext<Partial<AppContextState> | undefined>(
  undefined,
);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Get store actions and reset functions
  const resetAccounts = useAccountsStore((s) => s.reset);
  const resetFilters = useFiltersStore((s) => s.reset);
  const resetSettings = useSettingsStore((s) => s.reset);

  // Read accounts from store
  const accounts = useAccountsStore((state) => state.accounts);
  const createAccount = useAccountsStore((s) => s.createAccount);

  // Subscribe to tray-related settings for useEffect dependencies
  const showNotificationsCountInTray = useSettingsStore(
    (s) => s.showNotificationsCountInTray,
  );
  const useUnreadActiveIcon = useSettingsStore((s) => s.useUnreadActiveIcon);
  const useAlternateIdleIcon = useSettingsStore((s) => s.useAlternateIdleIcon);

  // Subscribe to theme related settings for useEffect dependencies
  const theme = useSettingsStore((s) => s.theme);
  const increaseContrast = useSettingsStore((s) => s.increaseContrast);

  const { setColorMode, setDayScheme, setNightScheme } = useTheme();

  const [isOnline, setIsOnline] = useState(false);

  const {
    status,
    globalError,

    notifications,
    notificationCount,
    unreadNotificationCount,
    hasNotifications,
    hasUnreadNotifications,

    refetchNotifications,

    markNotificationsAsRead,
    markNotificationsAsDone,
    unsubscribeNotification,
  } = useNotifications(accounts);

  // Periodic account refreshes
  useAccounts(accounts);

  // Theme
  useEffect(() => {
    const colorMode = mapThemeModeToColorMode(theme);
    const colorScheme = mapThemeModeToColorScheme(theme, increaseContrast);

    setColorMode(colorMode);

    // When colorScheme is null (System theme), use appropriate fallbacks
    // based on whether high contrast is enabled
    const dayFallback = increaseContrast
      ? DEFAULT_DAY_HIGH_CONTRAST_COLOR_SCHEME
      : DEFAULT_DAY_COLOR_SCHEME;
    const nightFallback = increaseContrast
      ? DEFAULT_NIGHT_HIGH_CONTRAST_COLOR_SCHEME
      : DEFAULT_NIGHT_COLOR_SCHEME;

    setDayScheme(colorScheme ?? dayFallback);
    setNightScheme(colorScheme ?? nightFallback);
  }, [theme, increaseContrast, setColorMode, setDayScheme, setNightScheme]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: We want to update the tray on setting or notification changes
  useEffect(() => {
    const trayCount = status === 'error' ? -1 : notificationCount;
    setTrayIconColorAndTitle(trayCount, isOnline);
  }, [
    showNotificationsCountInTray,
    useUnreadActiveIcon,
    useAlternateIdleIcon,
    status,
    notificationCount,
    isOnline,
  ]);

  useEffect(() => {
    window.gitify.onResetApp(() => {
      resetAccounts();
      resetSettings();
      resetFilters();
    });
  }, [resetAccounts, resetSettings, resetFilters]);

  // Online / Offline status monitoring via TanStack Query onlineManager
  useEffect(() => {
    const handle = () => {
      try {
        const online = onlineManager.isOnline();

        setIsOnline(online);
      } catch (_err) {
        // ignore
      }
    };

    // Subscribe and call immediately to set initial status
    const unsubscribe = onlineManager.subscribe(handle);
    handle();

    return () => unsubscribe();
  }, []);

  /**
   * Login to GitHub Gitify OAuth App.
   *
   * Initiate device flow session.
   */
  const loginWithDeviceFlowStart = useCallback(
    async () => await startGitHubDeviceFlow(),
    [],
  );

  /**
   * Login to GitHub Gitify OAuth App.
   *
   * Poll for device flow session.
   */
  const loginWithDeviceFlowPoll = useCallback(
    async (session: DeviceFlowSession) => await pollGitHubDeviceFlow(session),
    [],
  );

  /**
   * Login to GitHub Gitify OAuth App.
   *
   * Finalize device flow session.
   */
  const loginWithDeviceFlowComplete = useCallback(
    async (token: Token, hostname: Hostname) => {
      await createAccount('GitHub App', token, hostname);
    },
    [createAccount],
  );

  /**
   * Login with custom GitHub OAuth App.
   */
  const loginWithOAuthApp = useCallback(
    async (data: LoginOAuthWebOptions) => {
      const { authOptions, authCode } = await performGitHubWebOAuth(data);
      const token = await exchangeAuthCodeForAccessToken(authCode, authOptions);

      await createAccount('OAuth App', token, authOptions.hostname);
    },
    [createAccount],
  );

  /**
   * Login with Personal Access Token (PAT).
   */
  const loginWithPersonalAccessToken = useCallback(
    async ({ token, hostname }: LoginPersonalAccessTokenOptions) => {
      const encryptedToken = (await encryptValue(token)) as Token;
      await fetchAuthenticatedUserDetails({
        hostname,
        token: encryptedToken,
      } as Account);

      await createAccount('Personal Access Token', token, hostname);
    },
    [createAccount],
  );

  const contextValues: AppContextState = useMemo(
    () => ({
      status,
      globalError,

      loginWithDeviceFlowStart,
      loginWithDeviceFlowPoll,
      loginWithDeviceFlowComplete,
      loginWithOAuthApp,
      loginWithPersonalAccessToken,

      notifications,
      notificationCount,
      unreadNotificationCount,
      hasNotifications,
      hasUnreadNotifications,

      fetchNotifications: refetchNotifications,

      markNotificationsAsRead,
      markNotificationsAsDone,
      unsubscribeNotification,

      isOnline,
    }),
    [
      status,
      globalError,

      loginWithDeviceFlowStart,
      loginWithDeviceFlowPoll,
      loginWithDeviceFlowComplete,
      loginWithOAuthApp,
      loginWithPersonalAccessToken,

      notifications,
      notificationCount,
      unreadNotificationCount,
      hasNotifications,
      hasUnreadNotifications,

      refetchNotifications,

      markNotificationsAsRead,
      markNotificationsAsDone,
      unsubscribeNotification,

      isOnline,
    ],
  );

  return (
    <AppContext.Provider value={contextValues}>{children}</AppContext.Provider>
  );
};
