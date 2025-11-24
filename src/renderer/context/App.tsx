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
  SettingsState,
  SettingsValue,
  Status,
  Token,
} from '../types';
import { FetchType } from '../types';
import type { Notification } from '../typesGitHub';
import { headNotifications } from '../utils/api/client';
import type {
  LoginOAuthAppOptions,
  LoginPersonalAccessTokenOptions,
} from '../utils/auth/types';
import {
  addAccount,
  authGitHub,
  getToken,
  hasAccounts,
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
  DEFAULT_NIGHT_COLOR_SCHEME,
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

  markNotificationsAsRead: (notifications: Notification[]) => Promise<void>;
  markNotificationsAsDone: (notifications: Notification[]) => Promise<void>;
  unsubscribeNotification: (notification: Notification) => Promise<void>;

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

  const refreshAllAccounts = useCallback(() => {
    if (!auth.accounts.length) {
      return;
    }

    return Promise.all(auth.accounts.map(refreshAccount));
  }, [auth.accounts]);

  const migrateAuthTokens = useCallback(async () => {
    let tokensMigrated = false;

    for (const account of auth.accounts) {
      /**
       * Check if the account is using an encrypted token.
       * If not encrypt it and save it.
       */
      try {
        await decryptValue(account.token);
      } catch (_err) {
        const encryptedToken = await encryptValue(account.token);
        account.token = encryptedToken as Token;

        tokensMigrated = true;
      }
    }

    if (tokensMigrated) {
      setAuth(auth);
      saveState({ auth, settings });
    }
  }, [auth, settings]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Fetch new notifications when account count or filters change
  useEffect(() => {
    fetchNotifications({ auth, settings });
  }, [
    auth.accounts.length,
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: Refresh account details on startup
  useEffect(() => {
    migrateAuthTokens();

    refreshAllAccounts();
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
    setDayScheme(colorScheme ?? DEFAULT_DAY_COLOR_SCHEME);
    setNightScheme(colorScheme ?? DEFAULT_NIGHT_COLOR_SCHEME);
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

    const trayCount = status === 'error' ? -1 : unreadNotificationCount;
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

  const loginWithGitHubApp = useCallback(async () => {
    const { authCode } = await authGitHub();
    const { token } = await getToken(authCode);
    const hostname = Constants.DEFAULT_AUTH_OPTIONS.hostname;

    const updatedAuth = await addAccount(auth, 'GitHub App', token, hostname);

    setAuth(updatedAuth);
    saveState({ auth: updatedAuth, settings });
  }, [auth, settings]);

  const loginWithOAuthApp = useCallback(
    async (data: LoginOAuthAppOptions) => {
      const { authOptions, authCode } = await authGitHub(data);
      const { token, hostname } = await getToken(authCode, authOptions);

      const updatedAuth = await addAccount(auth, 'OAuth App', token, hostname);

      setAuth(updatedAuth);
      saveState({ auth: updatedAuth, settings });
    },
    [auth, settings],
  );

  const loginWithPersonalAccessToken = useCallback(
    async ({ token, hostname }: LoginPersonalAccessTokenOptions) => {
      const encryptedToken = (await encryptValue(token)) as Token;
      await headNotifications(hostname, encryptedToken);

      const updatedAuth = await addAccount(
        auth,
        'Personal Access Token',
        token,
        hostname,
      );

      setAuth(updatedAuth);
      saveState({ auth: updatedAuth, settings });
    },
    [auth, settings],
  );

  const logoutFromAccount = useCallback(
    async (account: Account) => {
      removeAccountNotifications(account);

      const updatedAuth = removeAccount(auth, account);

      setAuth(updatedAuth);
      saveState({ auth: updatedAuth, settings });
    },
    [auth, settings, removeAccountNotifications],
  );

  const fetchNotificationsWithAccounts = useCallback(
    async () => await fetchNotifications({ auth, settings }),
    [auth, settings, fetchNotifications],
  );

  const markNotificationsAsReadWithAccounts = useCallback(
    async (notifications: Notification[]) =>
      await markNotificationsAsRead({ auth, settings }, notifications),
    [auth, settings, markNotificationsAsRead],
  );

  const markNotificationsAsDoneWithAccounts = useCallback(
    async (notifications: Notification[]) =>
      await markNotificationsAsDone({ auth, settings }, notifications),
    [auth, settings, markNotificationsAsDone],
  );

  const unsubscribeNotificationWithAccounts = useCallback(
    async (notification: Notification) =>
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
