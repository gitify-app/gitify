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
  type SettingsState,
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
import { setAutoLaunch, updateTrayTitle } from '../utils/comms';
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
  markRepoNotifications: (notification: Notification) => Promise<void>;
  markRepoNotificationsDone: (notification: Notification) => Promise<void>;

  settings: SettingsState;
  updateSetting: (
    name: keyof SettingsState,
    value: boolean | Theme | string | null,
  ) => void;
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
    markRepoNotifications,
    markRepoNotificationsDone,
  } = useNotifications();

  useEffect(() => {
    restoreSettings();
  }, []);

  useEffect(() => {
    setTheme(settings.theme as Theme);
  }, [settings.theme]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: We only want fetchNotifications to be called for certain account or setting changes.
  useEffect(() => {
    fetchNotifications({ auth, settings });
  }, [
    settings.participating,
    settings.showBots,
    settings.detailedNotifications,
    auth.accounts.length,
  ]);

  useInterval(() => {
    fetchNotifications({ auth, settings });
  }, Constants.FETCH_INTERVAL);

  // biome-ignore lint/correctness/useExhaustiveDependencies: We need to update tray title when settings or notifications changes.
  useEffect(() => {
    const count = getNotificationCount(notifications);

    if (settings.showNotificationsCountInTray && count > 0) {
      updateTrayTitle(count.toString());
    } else {
      updateTrayTitle();
    }
  }, [settings.showNotificationsCountInTray, notifications]);

  const updateSetting = useCallback(
    (name: keyof SettingsState, value: boolean | Theme) => {
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
      const updatedAuth = addAccount(auth, 'OAuth App', token, hostname);
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
      setSettings({ ...defaultSettings, ...existing.settings });
      return existing.settings;
    }
  }, []);

  const fetchNotificationsWithAccounts = useCallback(
    async () => await fetchNotifications({ auth, settings }),
    [auth, settings, notifications],
  );

  const markNotificationReadWithAccounts = useCallback(
    async (notification: Notification) =>
      await markNotificationRead({ auth, settings }, notification),
    [auth, notifications],
  );

  const markNotificationDoneWithAccounts = useCallback(
    async (notification: Notification) =>
      await markNotificationDone({ auth, settings }, notification),
    [auth, notifications],
  );

  const unsubscribeNotificationWithAccounts = useCallback(
    async (notification: Notification) =>
      await unsubscribeNotification({ auth, settings }, notification),
    [auth, notifications],
  );

  const markRepoNotificationsWithAccounts = useCallback(
    async (notification: Notification) =>
      await markRepoNotifications({ auth, settings }, notification),
    [auth, notifications],
  );

  const markRepoNotificationsDoneWithAccounts = useCallback(
    async (notification: Notification) =>
      await markRepoNotificationsDone({ auth, settings }, notification),
    [auth, notifications],
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
        markRepoNotifications: markRepoNotificationsWithAccounts,
        markRepoNotificationsDone: markRepoNotificationsDoneWithAccounts,

        settings,
        updateSetting,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
