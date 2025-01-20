import { ipcRenderer, webFrame } from 'electron';
import {
  type ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useTheme } from '@primer/react';

import { namespacedEvent } from '../../shared/events';
import { useInterval } from '../hooks/useInterval';
import { useNotifications } from '../hooks/useNotifications';
import {
  type Account,
  type AccountNotifications,
  type AuthState,
  type GitifyError,
  GroupBy,
  OpenPreference,
  type SettingsState,
  type SettingsValue,
  type Status,
  Theme,
} from '../types';
import type { Notification } from '../typesGitHub';
import { headNotifications } from '../utils/api/client';
import { migrateAuthenticatedAccounts } from '../utils/auth/migration';
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
  setAlternateIdleIcon,
  setAutoLaunch,
  setKeyboardShortcut,
  updateTrayTitle,
} from '../utils/comms';
import { Constants } from '../utils/constants';
import { getNotificationCount } from '../utils/notifications';
import { clearState, loadState, saveState } from '../utils/storage';
import { getColorModeFromTheme, setTheme } from '../utils/theme';
import { zoomPercentageToLevel } from '../utils/zoom';

export const defaultAuth: AuthState = {
  accounts: [],
  token: null,
  enterpriseAccounts: [],
  user: null,
};

const defaultAppearanceSettings = {
  theme: Theme.SYSTEM,
  zoomPercentage: 100,
  detailedNotifications: true,
  showPills: true,
  showNumber: true,
  showAccountHeader: false,
};

const defaultNotificationSettings = {
  groupBy: GroupBy.REPOSITORY,
  fetchAllNotifications: true,
  participating: false,
  markAsDoneOnOpen: false,
  markAsDoneOnUnsubscribe: false,
  delayNotificationState: false,
};

const defaultSystemSettings = {
  openLinks: OpenPreference.FOREGROUND,
  keyboardShortcut: true,
  showNotificationsCountInTray: false,
  showNotifications: true,
  playSound: true,
  useAlternateIdleIcon: false,
  openAtStartup: false,
};

export const defaultFilters = {
  hideBots: false,
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
  loginWithGitHubApp: () => void;
  loginWithOAuthApp: (data: LoginOAuthAppOptions) => void;
  loginWithPersonalAccessToken: (data: LoginPersonalAccessTokenOptions) => void;
  logoutFromAccount: (account: Account) => void;

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
}

export const AppContext = createContext<Partial<AppContextState>>({});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { setColorMode } = useTheme();
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
    const mode = getColorModeFromTheme(settings.theme);

    setColorMode(mode);
    setTheme(settings.theme); // TODO - Replace fully with Primer design tokens and components
  }, [settings.theme]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: We only want fetchNotifications to be called for account changes
  useEffect(() => {
    fetchNotifications({ auth, settings });
  }, [auth.accounts]);

  useInterval(() => {
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
    await migrateAuthenticatedAccounts();
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
