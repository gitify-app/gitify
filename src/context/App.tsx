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

const defaultAuth: AuthState = {
  accounts: [],
  token: null,
  enterpriseAccounts: [],
  user: null,
};

export const defaultSettings: SettingsState = {
  participating: false,
  playSound: true,
  showNotifications: true,
  showBots: true,
  showNotificationsCountInTray: false,
  openAtStartup: false,
  theme: Theme.SYSTEM,
  detailedNotifications: true,
  markAsDoneOnOpen: false,
  showAccountHostname: false,
  delayNotificationState: false,
  showPills: true,
  keyboardShortcut: true,
  groupBy: GroupBy.REPOSITORY,
  filterReasons: '',
};

interface AppContextState {
  auth: AuthState;
  isLoggedIn: boolean;
  loginWithGitHubApp: () => void;
  loginWithOAuthApp: (data: LoginOAuthAppOptions) => void;
  loginWithPersonalAccessToken: (data: LoginPersonalAccessTokenOptions) => void;
  logoutFromAccount: (account: Account) => void;
  logout: () => void;

  notifications: AccountNotifications[];
  status: Status;
  errorDetails: GitifyError;
  removeNotificationFromState: (
    settings: SettingsState,
    notification: Notification,
  ) => void;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (notification: Notification) => Promise<void>;
  markNotificationDone: (notification: Notification) => Promise<void>;
  unsubscribeNotification: (notification: Notification) => Promise<void>;
  markRepoNotificationsRead: (notification: Notification) => Promise<void>;
  markRepoNotificationsDone: (notification: Notification) => Promise<void>;

  settings: SettingsState;
  updateSetting: (name: keyof SettingsState, value: SettingsValue) => void;
}

export const AppContext = createContext<Partial<AppContextState>>({});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(defaultAuth);
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const {
    fetchNotifications,
    notifications,
    errorDetails,
    status,
    removeNotificationFromState,
    markNotificationRead,
    markNotificationDone,
    unsubscribeNotification,
    markRepoNotificationsRead,
    markRepoNotificationsDone,
  } = useNotifications();

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
      const updatedAuth = removeAccount(auth, account);
      setAuth(updatedAuth);
      saveState({ auth: updatedAuth, settings });
    },
    [auth, settings],
  );

  const logout = useCallback(() => {
    setAuth(defaultAuth);
    clearState();
  }, []);

  const restoreSettings = useCallback(async () => {
    await migrateAuthenticatedAccounts();

    const existing = loadState();

    if (existing.auth) {
      setAuth({ ...defaultAuth, ...existing.auth });
    }

    if (existing.settings) {
      setKeyboardShortcut(existing.settings.keyboardShortcut);
      setSettings({ ...defaultSettings, ...existing.settings });
      return existing.settings;
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
        logout,

        notifications,
        status,
        errorDetails,
        removeNotificationFromState,
        fetchNotifications: fetchNotificationsWithAccounts,
        markNotificationRead: markNotificationReadWithAccounts,
        markNotificationDone: markNotificationDoneWithAccounts,
        unsubscribeNotification: unsubscribeNotificationWithAccounts,
        markRepoNotificationsRead: markRepoNotificationsReadWithAccounts,
        markRepoNotificationsDone: markRepoNotificationsDoneWithAccounts,

        settings,
        updateSetting,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
