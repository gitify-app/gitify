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
  FilterSettingsState,
  FilterValue,
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
  encryptValue,
  setAutoLaunch,
  setKeyboardShortcut,
  setUseAlternateIdleIcon,
  setUseUnreadActiveIcon,
} from '../utils/comms';
import {
  getNotificationCount,
  getUnreadNotificationCount,
} from '../utils/notifications/notifications';
import { clearState, loadState, saveState } from '../utils/storage';
import {
  DEFAULT_DAY_COLOR_SCHEME,
  DEFAULT_NIGHT_COLOR_SCHEME,
  mapThemeModeToColorMode,
  mapThemeModeToColorScheme,
} from '../utils/theme';
import { setTrayIconColorAndTitle } from '../utils/tray';
import { zoomLevelToPercentage, zoomPercentageToLevel } from '../utils/zoom';
import { defaultAuth, defaultFilters, defaultSettings } from './defaults';

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
  updateSetting: (name: keyof SettingsState, value: SettingsValue) => void;
  updateFilter: (
    name: keyof FilterSettingsState,
    value: FilterValue,
    checked: boolean,
  ) => void;
}

export const AppContext = createContext<Partial<AppContextState>>({});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { setColorMode, setDayScheme, setNightScheme } = useTheme();
  const [auth, setAuth] = useState<AuthState>(defaultAuth);
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [needsAccountRefresh, setNeedsAccountRefresh] = useState(false);

  const {
    removeAccountNotifications,
    fetchNotifications,
    notifications,
    globalError,
    status,
    markNotificationsAsRead,
    markNotificationsAsDone,
    unsubscribeNotification,
  } = useNotifications();

  const notificationCount = getNotificationCount(notifications);
  const unreadNotificationCount = getUnreadNotificationCount(notifications);

  const hasNotifications = useMemo(
    () => notificationCount > 0,
    [notificationCount],
  );
  const hasUnreadNotifications = useMemo(
    () => unreadNotificationCount > 0,
    [unreadNotificationCount],
  );

  const restoreSettings = useCallback(async () => {
    const existing = loadState();

    // Restore settings before accounts to ensure filters are available before fetching notifications
    if (existing.settings) {
      setSettings({ ...defaultSettings, ...existing.settings });
    }

    if (existing.auth) {
      setAuth({ ...defaultAuth, ...existing.auth });

      // Trigger the effect to refresh accounts and handle token encryption
      setNeedsAccountRefresh(true);
    }
  }, []);

  useEffect(() => {
    restoreSettings();
  }, [restoreSettings]);

  // Refresh account details on startup or restore
  useEffect(() => {
    if (!needsAccountRefresh || auth.accounts.length === 0) {
      return;
    }

    (async () => {
      for (const account of auth.accounts) {
        await refreshAccount(account);
      }

      setNeedsAccountRefresh(false);
    })();
  }, [needsAccountRefresh, auth.accounts]);

  // Refresh account details on interval
  useIntervalTimer(() => {
    for (const account of auth.accounts) {
      refreshAccount(account);
    }
  }, Constants.REFRESH_ACCOUNTS_INTERVAL_MS);

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
    globalThis.gitify.onResetApp(() => {
      clearState();
      setAuth(defaultAuth);
      setSettings(defaultSettings);
    });
  }, []);

  const clearFilters = useCallback(() => {
    const newSettings = { ...settings, ...defaultFilters };
    setSettings(newSettings);
    saveState({ auth, settings: newSettings });
  }, [auth, settings]);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    saveState({ auth, settings: defaultSettings });
  }, [auth]);

  const updateSetting = useCallback(
    (name: keyof SettingsState, value: SettingsValue) => {
      const newSettings = { ...settings, [name]: value };
      setSettings(newSettings);
      saveState({ auth, settings: newSettings });
    },
    [auth, settings],
  );

  const updateFilter = useCallback(
    (name: keyof FilterSettingsState, value: FilterValue, checked: boolean) => {
      const updatedFilters = checked
        ? [...settings[name], value]
        : settings[name].filter((item) => item !== value);

      updateSetting(name, updatedFilters as FilterValue[]);
    },
    [updateSetting, settings],
  );

  // Global window zoom handler / listener
  // biome-ignore lint/correctness/useExhaustiveDependencies: We want to update on settings.zoomPercentage changes
  useEffect(() => {
    // Set the zoom level when settings.zoomPercentage changes
    globalThis.gitify.zoom.setLevel(
      zoomPercentageToLevel(settings.zoomPercentage),
    );

    // Sync zoom percentage in settings when window is resized
    let timeout: NodeJS.Timeout;
    const DELAY = 200;

    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const zoomPercentage = zoomLevelToPercentage(
          globalThis.gitify.zoom.getLevel(),
        );

        updateSetting('zoomPercentage', zoomPercentage);
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
