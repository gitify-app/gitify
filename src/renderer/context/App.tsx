import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { ipcRenderer, webFrame } from 'electron';

import { useTheme } from '@primer/react';

import { namespacedEvent } from '../../shared/events';
import { useInactivityTimer } from '../hooks/useInactivityTimer';
import { useInterval } from '../hooks/useInterval';
import { useNotifications } from '../hooks/useNotifications';
import {
  type Account,
  type AccountNotifications,
  type AppearanceSettingsState,
  type AuthState,
  type FilterSettingsState,
  type FilterValue,
  type GitifyError,
  GroupBy,
  type NotificationSettingsState,
  OpenPreference,
  type SettingsState,
  type SettingsValue,
  type Status,
  type SystemSettingsState,
  Theme,
  type Token,
} from '../types';
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
  setAlternateIdleIcon,
  setAutoLaunch,
  setKeyboardShortcut,
  updateTrayTitle,
} from '../utils/comms';
import { Constants } from '../utils/constants';
import { getNotificationCount } from '../utils/notifications/notifications';
import { clearState, loadState, saveState } from '../utils/storage';
import {
  DEFAULT_DAY_COLOR_SCHEME,
  DEFAULT_NIGHT_COLOR_SCHEME,
  mapThemeModeToColorMode,
  mapThemeModeToColorScheme,
} from '../utils/theme';
import { zoomPercentageToLevel } from '../utils/zoom';

export const defaultAuth: AuthState = {
  accounts: [],
};

const defaultAppearanceSettings: AppearanceSettingsState = {
  theme: Theme.SYSTEM,
  increaseContrast: false,
  zoomPercentage: 100,
  showAccountHeader: false,
  wrapNotificationTitle: false,
};

const defaultNotificationSettings: NotificationSettingsState = {
  groupBy: GroupBy.REPOSITORY,
  fetchAllNotifications: true,
  detailedNotifications: true,
  showPills: true,
  showNumber: true,
  participating: false,
  markAsDoneOnOpen: false,
  markAsDoneOnUnsubscribe: false,
  delayNotificationState: false,
};

const defaultSystemSettings: SystemSettingsState = {
  openLinks: OpenPreference.FOREGROUND,
  keyboardShortcut: true,
  showNotificationsCountInTray: true,
  showNotifications: true,
  playSound: true,
  notificationVolume: 20,
  useAlternateIdleIcon: false,
  openAtStartup: false,
};

export const defaultFilters: FilterSettingsState = {
  filterUserTypes: [],
  filterIncludeHandles: [],
  filterExcludeHandles: [],
  filterSubjectTypes: [],
  filterStates: [],
  filterReasons: [],
};

export const defaultSettings: SettingsState = {
  ...defaultAppearanceSettings,
  ...defaultNotificationSettings,
  ...defaultSystemSettings,
  ...defaultFilters,
};

interface AppContextState {
  auth: AuthState;
  isLoggedIn: boolean;
  loginWithGitHubApp: () => Promise<void>;
  loginWithOAuthApp: (data: LoginOAuthAppOptions) => Promise<void>;
  loginWithPersonalAccessToken: (
    data: LoginPersonalAccessTokenOptions,
  ) => Promise<void>;
  logoutFromAccount: (account: Account) => Promise<void>;

  notifications: AccountNotifications[];
  status: Status;
  globalError: GitifyError;
  removeAccountNotifications: (account: Account) => Promise<void>;
  fetchNotifications: () => Promise<void>;
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
    fetchNotifications({ auth, settings });
  }, [
    auth.accounts,
    settings.filterUserTypes,
    settings.filterIncludeHandles,
    settings.filterExcludeHandles,
    settings.filterReasons,
  ]);

  useInactivityTimer(() => {
    fetchNotifications({ auth, settings });
  }, Constants.FETCH_NOTIFICATIONS_INTERVAL);

  useInterval(() => {
    for (const account of auth.accounts) {
      refreshAccount(account);
    }
  }, Constants.REFRESH_ACCOUNTS_INTERVAL);

  useEffect(() => {
    const count = getNotificationCount(notifications);

    if (settings.showNotificationsCountInTray && count > 0) {
      updateTrayTitle(count.toString());
    } else {
      updateTrayTitle();
    }
  }, [settings.showNotificationsCountInTray, notifications]);

  useEffect(() => {
    setKeyboardShortcut(settings.keyboardShortcut);
  }, [settings.keyboardShortcut]);

  useEffect(() => {
    ipcRenderer.on(namespacedEvent('reset-app'), () => {
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
      if (name === 'openAtStartup') {
        setAutoLaunch(value as boolean);
      }
      if (name === 'useAlternateIdleIcon') {
        setAlternateIdleIcon(value as boolean);
      }

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
      await headNotifications(hostname, token);
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
      // Remove notifications for account
      removeAccountNotifications(account);

      // Remove from auth state
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
      setKeyboardShortcut(existing.settings.keyboardShortcut);
      setAlternateIdleIcon(existing.settings.useAlternateIdleIcon);
      setSettings({ ...defaultSettings, ...existing.settings });
      webFrame.setZoomLevel(
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

  return (
    <AppContext.Provider
      value={{
        auth,
        isLoggedIn,
        loginWithGitHubApp,
        loginWithOAuthApp,
        loginWithPersonalAccessToken,
        logoutFromAccount,

        notifications,
        status,
        globalError,
        fetchNotifications: fetchNotificationsWithAccounts,
        markNotificationsAsRead: markNotificationsAsReadWithAccounts,
        markNotificationsAsDone: markNotificationsAsDoneWithAccounts,
        unsubscribeNotification: unsubscribeNotificationWithAccounts,

        settings,
        clearFilters,
        resetSettings,
        updateSetting,
        updateFilter,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
