import { ipcRenderer, webFrame } from 'electron';
import {
  type ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
  getUserData,
  removeAccount,
} from '../utils/auth/utils';
import {
  setAutoLaunch,
  setKeyboardShortcut,
  updateTrayTitle,
} from '../utils/comms';
import Constants from '../utils/constants';
import { getNotificationCount } from '../utils/notifications';
import { clearState, loadState, saveState } from '../utils/storage';
import { setTheme } from '../utils/theme';
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
  showAccountHostname: false,
};

const defaultNotificationSettings = {
  groupBy: GroupBy.REPOSITORY,
  participating: false,
  markAsDoneOnOpen: false,
  delayNotificationState: false,
};

const defaultSystemSettings = {
  openLinks: OpenPreference.FOREGROUND,
  keyboardShortcut: true,
  showNotificationsCountInTray: false,
  showNotifications: true,
  playSound: true,
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
  markNotificationRead: (notification: Notification) => Promise<void>;
  markNotificationDone: (notification: Notification) => Promise<void>;
  unsubscribeNotification: (notification: Notification) => Promise<void>;
  markRepoNotificationsRead: (notification: Notification) => Promise<void>;
  markRepoNotificationsDone: (notification: Notification) => Promise<void>;

  settings: SettingsState;
  clearFilters: () => void;
  resetSettings: () => void;
  updateSetting: (name: keyof SettingsState, value: SettingsValue) => void;
}

export const AppContext = createContext<Partial<AppContextState>>({});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(defaultAuth);
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const {
    removeAccountNotifications,
    fetchNotifications,
    notifications,
    globalError,
    status,
    markNotificationRead,
    markNotificationDone,
    unsubscribeNotification,
    markRepoNotificationsRead,
    markRepoNotificationsDone,
  } = useNotifications();
  getNotificationCount;
  useEffect(() => {
    restoreSettings();
  }, []);

  useEffect(() => {
    setTheme(settings.theme);
  }, [settings.theme]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: We only want fetchNotifications to be called for account changes
  useEffect(() => {
    fetchNotifications({ auth, settings });
  }, [auth.accounts]);

  useInterval(() => {
    fetchNotifications({ auth, settings });
  }, Constants.FETCH_INTERVAL);

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
    ipcRenderer.on('gitify:reset-app', () => {
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

      const newSettings = { ...settings, [name]: value };
      setSettings(newSettings);
      saveState({ auth, settings: newSettings });
    },
    [auth, settings],
  );

  const isLoggedIn = useMemo(() => {
    return auth.accounts.length > 0;
  }, [auth]);

  const loginWithGitHubApp = useCallback(async () => {
    const { authCode } = await authGitHub();
    const { token } = await getToken(authCode);
    const hostname = Constants.DEFAULT_AUTH_OPTIONS.hostname;
    const user = await getUserData(token, hostname);
    const updatedAuth = addAccount(auth, 'GitHub App', token, hostname, user);
    setAuth(updatedAuth);
    saveState({ auth: updatedAuth, settings });
  }, [auth, settings]);

  const loginWithOAuthApp = useCallback(
    async (data: LoginOAuthAppOptions) => {
      const { authOptions, authCode } = await authGitHub(data);
      const { token, hostname } = await getToken(authCode, authOptions);
      const user = await getUserData(token, hostname);
      const updatedAuth = addAccount(auth, 'OAuth App', token, hostname, user);
      setAuth(updatedAuth);
      saveState({ auth: updatedAuth, settings });
    },
    [auth, settings],
  );

  const loginWithPersonalAccessToken = useCallback(
    async ({ token, hostname }: LoginPersonalAccessTokenOptions) => {
      await headNotifications(hostname, token);
      const user = await getUserData(token, hostname);
      const updatedAuth = addAccount(
        auth,
        'Personal Access Token',
        token,
        hostname,
        user,
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

    if (existing.auth) {
      setAuth({ ...defaultAuth, ...existing.auth });
    }

    if (existing.settings) {
      setKeyboardShortcut(existing.settings.keyboardShortcut);
      setSettings({ ...defaultSettings, ...existing.settings });
      webFrame.setZoomLevel(
        zoomPercentageToLevel(existing.settings.zoomPercentage),
      );
      return existing.settings;
    }

    for (const account of auth.accounts.filter(
      (a) => a.platform === 'GitHub Enterprise Server',
    )) {
      const res = await headNotifications(account.hostname, account.token);
      account.version = res.headers['x-github-enterprise-version'];
    }
  }, []);

  const fetchNotificationsWithAccounts = useCallback(
    async () => await fetchNotifications({ auth, settings }),
    [auth, settings, fetchNotifications],
  );

  const markNotificationReadWithAccounts = useCallback(
    async (notification: Notification) =>
      await markNotificationRead({ auth, settings }, notification),
    [auth, settings, markNotificationRead],
  );

  const markNotificationDoneWithAccounts = useCallback(
    async (notification: Notification) =>
      await markNotificationDone({ auth, settings }, notification),
    [auth, settings, markNotificationDone],
  );

  const unsubscribeNotificationWithAccounts = useCallback(
    async (notification: Notification) =>
      await unsubscribeNotification({ auth, settings }, notification),
    [auth, settings, unsubscribeNotification],
  );

  const markRepoNotificationsReadWithAccounts = useCallback(
    async (notification: Notification) =>
      await markRepoNotificationsRead({ auth, settings }, notification),
    [auth, settings, markRepoNotificationsRead],
  );

  const markRepoNotificationsDoneWithAccounts = useCallback(
    async (notification: Notification) =>
      await markRepoNotificationsDone({ auth, settings }, notification),
    [auth, settings, markRepoNotificationsDone],
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
        markNotificationRead: markNotificationReadWithAccounts,
        markNotificationDone: markNotificationDoneWithAccounts,
        unsubscribeNotification: unsubscribeNotificationWithAccounts,
        markRepoNotificationsRead: markRepoNotificationsReadWithAccounts,
        markRepoNotificationsDone: markRepoNotificationsDoneWithAccounts,

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
