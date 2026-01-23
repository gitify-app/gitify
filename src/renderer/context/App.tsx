import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useTheme } from '@primer/react';

import { Constants } from '../constants';

import { useInactivityTimer } from '../hooks/timers/useInactivityTimer';
import { useIntervalTimer } from '../hooks/timers/useIntervalTimer';
import { useNotifications } from '../hooks/useNotifications';

import type {
  Account,
  AccountNotifications,
  AuthState,
  ConfigSettingsState,
  ConfigSettingsValue,
  FilterSettingsState,
  FilterSettingsValue,
  GitifyError,
  GitifyNotification,
  SettingsState,
  SettingsValue,
  Status,
  Token,
} from '../types';
import { FetchType } from '../types';
import type {
  LoginOAuthAppOptions,
  LoginPersonalAccessTokenOptions,
} from '../utils/auth/types';

import { clearOctokitClientCache } from '../utils/api/octokit';
import {
  addAccount,
  exchangeAuthCodeForAccessToken,
  getAccountUUID,
  hasAccounts,
  performGitHubOAuth,
  refreshAccount,
  removeAccount,
} from '../utils/auth/utils';
import {
  decryptValue,
  encryptValue,
  setAutoLaunch,
  setKeyboardShortcut,
  setUseAlternateIdleIcon,
  setUseUnreadActiveIcon,
} from '../utils/comms';
import { clearState, loadState, saveState } from '../utils/storage';
import {
  DEFAULT_DAY_COLOR_SCHEME,
  DEFAULT_DAY_HIGH_CONTRAST_COLOR_SCHEME,
  DEFAULT_NIGHT_COLOR_SCHEME,
  DEFAULT_NIGHT_HIGH_CONTRAST_COLOR_SCHEME,
  mapThemeModeToColorMode,
  mapThemeModeToColorScheme,
} from '../utils/theme';
import { setTrayIconColorAndTitle } from '../utils/tray';
import { zoomLevelToPercentage, zoomPercentageToLevel } from '../utils/zoom';
import {
  defaultAuth,
  defaultFilterSettings,
  defaultSettings,
} from './defaults';

export interface AppContextState {
  auth: AuthState;
  isLoggedIn: boolean;
  loginWithGitHubApp: () => Promise<void>;
  loginWithOAuthApp: (data: LoginOAuthAppOptions) => Promise<void>;
  loginWithPersonalAccessToken: (
    data: LoginPersonalAccessTokenOptions,
  ) => Promise<void>;
  logoutFromAccount: (account: Account) => Promise<void>;

  status: Status;
  globalError: GitifyError;

  notifications: AccountNotifications[];
  notificationCount: number;
  unreadNotificationCount: number;
  hasNotifications: boolean;
  hasUnreadNotifications: boolean;

  fetchNotifications: () => Promise<void>;
  removeAccountNotifications: (account: Account) => Promise<void>;

  markNotificationsAsRead: (
    notifications: GitifyNotification[],
  ) => Promise<void>;
  markNotificationsAsDone: (
    notifications: GitifyNotification[],
  ) => Promise<void>;
  unsubscribeNotification: (notification: GitifyNotification) => Promise<void>;

  settings: SettingsState;
  clearFilters: () => void;
  resetSettings: () => void;
  updateSetting: (
    name: keyof ConfigSettingsState,
    value: ConfigSettingsValue,
  ) => void;
  updateFilter: (
    name: keyof FilterSettingsState,
    value: FilterSettingsValue,
    checked: boolean,
  ) => void;
}

export const AppContext = createContext<Partial<AppContextState>>({});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const existingState = loadState();

  const [auth, setAuth] = useState<AuthState>(
    existingState.auth
      ? { ...defaultAuth, ...existingState.auth }
      : defaultAuth,
  );

  const [settings, setSettings] = useState<SettingsState>(
    existingState.settings
      ? { ...defaultSettings, ...existingState.settings }
      : defaultSettings,
  );

  const { setColorMode, setDayScheme, setNightScheme } = useTheme();

  const {
    status,
    globalError,

    notifications,
    notificationCount,
    unreadNotificationCount,
    hasNotifications,
    hasUnreadNotifications,

    fetchNotifications,
    removeAccountNotifications,

    markNotificationsAsRead,
    markNotificationsAsDone,
    unsubscribeNotification,
  } = useNotifications();

  const persistAuth = useCallback(
    (nextAuth: AuthState) => {
      setAuth(nextAuth);
      saveState({ auth: nextAuth, settings });
    },
    [settings],
  );

  const refreshAllAccounts = useCallback(async () => {
    if (!auth.accounts.length) {
      return;
    }

    const refreshedAccounts = await Promise.all(
      auth.accounts.map((account) => refreshAccount(account)),
    );

    const updatedAuth: AuthState = {
      ...auth,
      accounts: refreshedAccounts,
    };

    persistAuth(updatedAuth);
  }, [auth, persistAuth]);

  // TODO - Remove migration logic in future release
  const migrateAuthTokens = useCallback(async () => {
    const migratedAccounts = await Promise.all(
      auth.accounts.map(async (account) => {
        try {
          await decryptValue(account.token);
          return account;
        } catch {
          const encryptedToken = (await encryptValue(account.token)) as Token;
          return { ...account, token: encryptedToken };
        }
      }),
    );

    const tokensMigrated = migratedAccounts.some((migratedAccount) => {
      const originalAccount = auth.accounts.find(
        (account) =>
          getAccountUUID(account) === getAccountUUID(migratedAccount),
      );

      if (!originalAccount) {
        return true;
      }

      return migratedAccount.token !== originalAccount.token;
    });

    if (!tokensMigrated) {
      return;
    }

    const updatedAuth: AuthState = {
      ...auth,
      accounts: migratedAccounts,
    };

    persistAuth(updatedAuth);
  }, [auth, persistAuth]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Fetch new notifications when account count or filters change
  useEffect(() => {
    fetchNotifications({ auth, settings });
  }, [
    auth.accounts.length,
    settings.participating,
    settings.filterIncludeSearchTokens,
    settings.filterExcludeSearchTokens,
    settings.filterUserTypes,
    settings.filterSubjectTypes,
    settings.filterStates,
    settings.filterReasons,
  ]);

  useIntervalTimer(
    () => {
      fetchNotifications({ auth, settings });
    },
    settings.fetchType === FetchType.INTERVAL ? settings.fetchInterval : null,
  );

  useInactivityTimer(
    () => {
      fetchNotifications({ auth, settings });
    },
    settings.fetchType === FetchType.INACTIVITY ? settings.fetchInterval : null,
  );

  /**
   * On startup, check if auth tokens need encrypting and refresh all account details
   */
  // biome-ignore lint/correctness/useExhaustiveDependencies: Run once on startup
  useEffect(() => {
    void (async () => {
      await migrateAuthTokens();
      await refreshAllAccounts();
    })();
  }, []);

  // Refresh account details on interval
  useIntervalTimer(() => {
    refreshAllAccounts();
  }, Constants.REFRESH_ACCOUNTS_INTERVAL_MS);

  // Theme
  useEffect(() => {
    const colorMode = mapThemeModeToColorMode(settings.theme);
    const colorScheme = mapThemeModeToColorScheme(
      settings.theme,
      settings.increaseContrast,
    );

    setColorMode(colorMode);

    // When colorScheme is null (System theme), use appropriate fallbacks
    // based on whether high contrast is enabled
    const dayFallback = settings.increaseContrast
      ? DEFAULT_DAY_HIGH_CONTRAST_COLOR_SCHEME
      : DEFAULT_DAY_COLOR_SCHEME;
    const nightFallback = settings.increaseContrast
      ? DEFAULT_NIGHT_HIGH_CONTRAST_COLOR_SCHEME
      : DEFAULT_NIGHT_COLOR_SCHEME;

    setDayScheme(colorScheme ?? dayFallback);
    setNightScheme(colorScheme ?? nightFallback);
  }, [
    settings.theme,
    settings.increaseContrast,
    setColorMode,
    setDayScheme,
    setNightScheme,
  ]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: We want to update the tray on setting or notification changes
  useEffect(() => {
    setUseUnreadActiveIcon(settings.useUnreadActiveIcon);
    setUseAlternateIdleIcon(settings.useAlternateIdleIcon);

    const trayCount = status === 'error' ? -1 : notificationCount;
    setTrayIconColorAndTitle(trayCount, settings);
  }, [
    settings.showNotificationsCountInTray,
    settings.useUnreadActiveIcon,
    settings.useAlternateIdleIcon,
    notifications,
  ]);

  useEffect(() => {
    setKeyboardShortcut(settings.keyboardShortcut);
  }, [settings.keyboardShortcut]);

  useEffect(() => {
    setAutoLaunch(settings.openAtStartup);
  }, [settings.openAtStartup]);

  useEffect(() => {
    window.gitify.onResetApp(() => {
      clearState();
      setAuth(defaultAuth);
      setSettings(defaultSettings);
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSettings((prevSettings) => {
      const newSettings = { ...prevSettings, ...defaultFilterSettings };
      saveState({ auth, settings: newSettings });
      return newSettings;
    });
  }, [auth]);

  const resetSettings = useCallback(() => {
    setSettings(() => {
      saveState({ auth, settings: defaultSettings });
      return defaultSettings;
    });
  }, [auth]);

  const updateSetting = useCallback(
    (name: keyof SettingsState, value: SettingsValue) => {
      setSettings((prevSettings) => {
        const newSettings = { ...prevSettings, [name]: value };
        saveState({ auth, settings: newSettings });
        return newSettings;
      });
    },
    [auth],
  );

  const updateFilter = useCallback(
    (
      name: keyof FilterSettingsState,
      value: FilterSettingsValue,
      checked: boolean,
    ) => {
      const updatedFilters = checked
        ? [...settings[name], value]
        : settings[name].filter((item) => item !== value);

      updateSetting(name, updatedFilters);
    },
    [updateSetting, settings],
  );

  // Global window zoom handler / listener
  // biome-ignore lint/correctness/useExhaustiveDependencies: We want to update on settings.zoomPercentage changes
  useEffect(() => {
    // Set the zoom level when settings.zoomPercentage changes
    window.gitify.zoom.setLevel(zoomPercentageToLevel(settings.zoomPercentage));

    // Sync zoom percentage in settings when window is resized
    let timeout: NodeJS.Timeout;
    const DELAY = 200;

    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const zoomPercentage = zoomLevelToPercentage(
          window.gitify.zoom.getLevel(),
        );

        if (zoomPercentage !== settings.zoomPercentage) {
          updateSetting('zoomPercentage', zoomPercentage);
        }
      }, DELAY);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeout);
    };
  }, [settings.zoomPercentage]);

  const isLoggedIn = useMemo(() => {
    return hasAccounts(auth);
  }, [auth]);

  /**
   * Login with GitHub App.
   *
   * Note: although we call this "Login with GitHub App", this function actually
   * authenticates via a predefined "Gitify" GitHub OAuth App.
   */
  const loginWithGitHubApp = useCallback(async () => {
    const { authCode } = await performGitHubOAuth();
    const token = await exchangeAuthCodeForAccessToken(authCode);
    const hostname = Constants.DEFAULT_AUTH_OPTIONS.hostname;

    const updatedAuth = await addAccount(auth, 'GitHub App', token, hostname);

    persistAuth(updatedAuth);
  }, [auth, persistAuth]);

  /**
   * Login with custom GitHub OAuth App.
   */
  const loginWithOAuthApp = useCallback(
    async (data: LoginOAuthAppOptions) => {
      const { authOptions, authCode } = await performGitHubOAuth(data);
      const token = await exchangeAuthCodeForAccessToken(authCode, authOptions);

      const updatedAuth = await addAccount(
        auth,
        'OAuth App',
        token,
        authOptions.hostname,
      );

      persistAuth(updatedAuth);
    },
    [auth, persistAuth],
  );

  /**
   * Login with Personal Access Token (PAT).
   */
  const loginWithPersonalAccessToken = useCallback(
    async ({ token, hostname }: LoginPersonalAccessTokenOptions) => {
      // const encryptedToken = (await encryptValue(token)) as Token;
      // await headNotifications(hostname, encryptedToken);

      const updatedAuth = await addAccount(
        auth,
        'Personal Access Token',
        token,
        hostname,
      );

      persistAuth(updatedAuth);
    },
    [auth, persistAuth],
  );

  const logoutFromAccount = useCallback(
    async (account: Account) => {
      removeAccountNotifications(account);

      const updatedAuth = removeAccount(auth, account);

      // Clear Octokit client cache when removing account
      clearOctokitClientCache();

      persistAuth(updatedAuth);
    },
    [auth, removeAccountNotifications, persistAuth],
  );

  const fetchNotificationsWithAccounts = useCallback(
    async () => await fetchNotifications({ auth, settings }),
    [auth, settings, fetchNotifications],
  );

  const markNotificationsAsReadWithAccounts = useCallback(
    async (notifications: GitifyNotification[]) =>
      await markNotificationsAsRead({ auth, settings }, notifications),
    [auth, settings, markNotificationsAsRead],
  );

  const markNotificationsAsDoneWithAccounts = useCallback(
    async (notifications: GitifyNotification[]) =>
      await markNotificationsAsDone({ auth, settings }, notifications),
    [auth, settings, markNotificationsAsDone],
  );

  const unsubscribeNotificationWithAccounts = useCallback(
    async (notification: GitifyNotification) =>
      await unsubscribeNotification({ auth, settings }, notification),
    [auth, settings, unsubscribeNotification],
  );

  const contextValues: AppContextState = useMemo(
    () => ({
      auth,
      isLoggedIn,
      loginWithGitHubApp,
      loginWithOAuthApp,
      loginWithPersonalAccessToken,
      logoutFromAccount,

      status,
      globalError,

      notifications,
      notificationCount,
      unreadNotificationCount,
      hasNotifications,
      hasUnreadNotifications,

      fetchNotifications: fetchNotificationsWithAccounts,
      removeAccountNotifications,

      markNotificationsAsRead: markNotificationsAsReadWithAccounts,
      markNotificationsAsDone: markNotificationsAsDoneWithAccounts,
      unsubscribeNotification: unsubscribeNotificationWithAccounts,

      settings,
      clearFilters,
      resetSettings,
      updateSetting,
      updateFilter,
    }),
    [
      auth,
      isLoggedIn,
      loginWithGitHubApp,
      loginWithOAuthApp,
      loginWithPersonalAccessToken,
      logoutFromAccount,

      status,
      globalError,

      notifications,
      notificationCount,
      unreadNotificationCount,
      hasNotifications,
      hasUnreadNotifications,

      fetchNotificationsWithAccounts,
      removeAccountNotifications,

      markNotificationsAsReadWithAccounts,
      markNotificationsAsDoneWithAccounts,
      unsubscribeNotificationWithAccounts,

      settings,
      clearFilters,
      resetSettings,
      updateSetting,
      updateFilter,
    ],
  );

  return (
    <AppContext.Provider value={contextValues}>{children}</AppContext.Provider>
  );
};
