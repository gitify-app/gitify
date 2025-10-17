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
import { clearApiCache } from '../utils/api/request';
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
  updateTrayColor,
  updateTrayTitle,
} from '../utils/comms';
import { getNotificationCount } from '../utils/notifications/notifications';
import { clearState, loadState, saveState } from '../utils/storage';
import {
  DEFAULT_DAY_COLOR_SCHEME,
  DEFAULT_NIGHT_COLOR_SCHEME,
  mapThemeModeToColorMode,
  mapThemeModeToColorScheme,
} from '../utils/theme';
import { zoomPercentageToLevel } from '../utils/zoom';
import { defaultAuth, defaultFilters, defaultSettings } from './defaults';

interface AppContextState {
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: restoreSettings is stable and should run only once
  useEffect(() => {
    restoreSettings();
  }, []);

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: We only want fetchNotifications to be called for particular state changes
  useEffect(() => {
    clearApiCache();
    fetchNotifications({ auth, settings });
  }, [
    auth.accounts,
    settings.filterUserTypes,
    settings.filterIncludeSearchTokens,
    settings.filterExcludeSearchTokens,
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

  useIntervalTimer(() => {
    for (const account of auth.accounts) {
      refreshAccount(account);
    }
  }, Constants.REFRESH_ACCOUNTS_INTERVAL_MS);

  useEffect(() => {
    const count = getNotificationCount(notifications);

    let title = '';
    if (settings.showNotificationsCountInTray && count > 0) {
      title = count.toString();
    }

    setUseUnreadActiveIcon(settings.useUnreadActiveIcon);
    setUseAlternateIdleIcon(settings.useAlternateIdleIcon);

    updateTrayColor(count);
    updateTrayTitle(title);
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
    [auth, settings],
  );

  const restoreSettings = useCallback(async () => {
    const existing = loadState();

    // Restore settings before accounts to ensure filters are available before fetching notifications
    if (existing.settings) {
      setUseUnreadActiveIcon(existing.settings.useUnreadActiveIcon);
      setUseAlternateIdleIcon(existing.settings.useAlternateIdleIcon);
      setKeyboardShortcut(existing.settings.keyboardShortcut);
      setSettings({ ...defaultSettings, ...existing.settings });
      window.gitify.zoom.setLevel(
        zoomPercentageToLevel(existing.settings.zoomPercentage),
      );
    }

    if (existing.auth) {
      setAuth({ ...defaultAuth, ...existing.auth });

      // Refresh account data on app start
      for (const account of existing.auth.accounts) {
        /**
         * Check if the account is using an encrypted token.
         * If not encrypt it and save it.
         */
        try {
          await decryptValue(account.token);
        } catch (_err) {
          const encryptedToken = await encryptValue(account.token);
          account.token = encryptedToken as Token;
        }

        await refreshAccount(account);
      }
    }
  }, []);

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

  const contextValues = useMemo(
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
      fetchNotifications: fetchNotificationsWithAccounts,

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
      fetchNotificationsWithAccounts,
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
