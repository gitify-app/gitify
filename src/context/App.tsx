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
  type AccountNotifications,
  type AuthState,
  type GitifyError,
  type SettingsState,
  type Status,
  Theme,
} from '../types';
import { headNotifications } from '../utils/api/client';
import { migrateAuthenticatedAccounts } from '../utils/auth/migration';
import type {
  AuthOptionsOAuthApp,
  AuthOptionsPersonalAccessToken,
} from '../utils/auth/types';
import {
  addAccount,
  authGitHub,
  getToken,
  getUserData,
} from '../utils/auth/utils';
import { setAutoLaunch, updateTrayTitle } from '../utils/comms';
import Constants from '../utils/constants';
import { getNotificationCount } from '../utils/notifications';
import { clearState, loadState, saveState } from '../utils/storage';
import { setTheme } from '../utils/theme';

const defaultAuthState: AuthState = {
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
};

interface AppContextState {
  auth: AuthState;
  isLoggedIn: boolean;
  loginWithGitHubApp: () => void;
  loginWithOAuthApp: (data: AuthOptionsOAuthApp) => void;
  loginWithPersonalAccessToken: (data: AuthOptionsPersonalAccessToken) => void;
  logout: () => void;

  notifications: AccountNotifications[];
  status: Status;
  errorDetails: GitifyError;
  removeNotificationFromState: (
    settings: SettingsState,
    id: string,
    hostname: string,
  ) => void;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string, hostname: string) => Promise<void>;
  markNotificationDone: (id: string, hostname: string) => Promise<void>;
  unsubscribeNotification: (id: string, hostname: string) => Promise<void>;
  markRepoNotifications: (id: string, hostname: string) => Promise<void>;
  markRepoNotificationsDone: (id: string, hostname: string) => Promise<void>;

  settings: SettingsState;
  updateSetting: (
    name: keyof SettingsState,
    value: boolean | Theme | string | null,
  ) => void;
}

export const AppContext = createContext<Partial<AppContextState>>({});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(defaultAuthState);
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
    fetchNotifications(auth, settings);
  }, [
    settings.participating,
    settings.showBots,
    settings.detailedNotifications,
    auth.accounts.length,
  ]);

  useInterval(() => {
    fetchNotifications(auth, settings);
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
      saveState(auth, newSettings);
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
    const updatedAccounts = addAccount(
      auth,
      'GitHub App',
      token,
      hostname,
      user,
    );
    setAuth(updatedAccounts);
    saveState(updatedAccounts, settings);
  }, [auth, settings]);

  const loginWithOAuthApp = useCallback(
    async (data: AuthOptionsOAuthApp) => {
      const { authOptions, authCode } = await authGitHub(data);
      const { token, hostname } = await getToken(authCode, authOptions);
      const updatedAccounts = addAccount(auth, 'OAuth App', token, hostname);
      setAuth(updatedAccounts);
      saveState(updatedAccounts, settings);
    },
    [auth, settings],
  );

  const loginWithPersonalAccessToken = useCallback(
    async ({ token, hostname }: AuthOptionsPersonalAccessToken) => {
      await headNotifications(hostname, token);

      const user = await getUserData(token, hostname);
      const updatedAccounts = addAccount(
        auth,
        'Personal Access Token',
        token,
        hostname,
        user,
      );
      setAuth(updatedAccounts);
      saveState(updatedAccounts, settings);
    },
    [auth, settings],
  );

  const logout = useCallback(() => {
    setAuth(defaultAuthState);
    clearState();
  }, []);

  const restoreSettings = useCallback(() => {
    // Migrate authenticated accounts
    migrateAuthenticatedAccounts();

    const existing = loadState();

    if (existing.auth) {
      setAuth({ ...defaultAuthState, ...existing.auth });
    }

    if (existing.settings) {
      setSettings({ ...defaultSettings, ...existing.settings });
      return existing.settings;
    }
  }, []);

  const fetchNotificationsWithAccounts = useCallback(
    async () => await fetchNotifications(auth, settings),
    [auth, settings, notifications],
  );

  const markNotificationReadWithAccounts = useCallback(
    async (id: string, hostname: string) =>
      await markNotificationRead(auth, settings, id, hostname),
    [auth, notifications],
  );

  const markNotificationDoneWithAccounts = useCallback(
    async (id: string, hostname: string) =>
      await markNotificationDone(auth, settings, id, hostname),
    [auth, notifications],
  );

  const unsubscribeNotificationWithAccounts = useCallback(
    async (id: string, hostname: string) =>
      await unsubscribeNotification(auth, settings, id, hostname),
    [auth, notifications],
  );

  const markRepoNotificationsWithAccounts = useCallback(
    async (repoSlug: string, hostname: string) =>
      await markRepoNotifications(auth, settings, repoSlug, hostname),
    [auth, notifications],
  );

  const markRepoNotificationsDoneWithAccounts = useCallback(
    async (repoSlug: string, hostname: string) =>
      await markRepoNotificationsDone(auth, settings, repoSlug, hostname),
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
