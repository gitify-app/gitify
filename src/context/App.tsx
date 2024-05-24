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
  type AuthAccounts,
  type GitifyError,
  type SettingsState,
  type Status,
  Theme,
} from '../types';
import { headNotifications } from '../utils/api/client';
import { addAccount, authGitHub, getToken, getUserData } from '../utils/auth';
import { migrateAuthenticatedAccounts } from '../utils/auth/migration';
import type {
  AuthOptionsOAuthApp,
  AuthOptionsPersonalAccessToken,
} from '../utils/auth/types';
import { setAutoLaunch, updateTrayTitle } from '../utils/comms';
import Constants from '../utils/constants';
import { getNotificationCount } from '../utils/notifications';
import { clearState, loadState, saveState } from '../utils/storage';
import { setTheme } from '../utils/theme';

const defaultAuthState: AuthAccounts = {
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
  authAccounts: AuthAccounts;
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
  const [authAccounts, setAuthAccounts] =
    useState<AuthAccounts>(defaultAuthState);
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
    fetchNotifications(authAccounts, settings);
  }, [
    settings.participating,
    settings.showBots,
    settings.detailedNotifications,
    authAccounts.accounts.length,
  ]);

  useInterval(() => {
    fetchNotifications(authAccounts, settings);
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
      saveState(authAccounts, newSettings);
    },
    [authAccounts, settings],
  );

  const isLoggedIn = useMemo(() => {
    return authAccounts.accounts.length > 0;
  }, [authAccounts]);

  const loginWithGitHubApp = useCallback(async () => {
    const { authCode } = await authGitHub();
    const { token } = await getToken(authCode);
    const hostname = Constants.DEFAULT_AUTH_OPTIONS.hostname;
    const user = await getUserData(token, hostname);
    const updatedAccounts = addAccount(
      authAccounts,
      'GitHub App',
      token,
      hostname,
      user,
    );
    setAuthAccounts(updatedAccounts);
    saveState(updatedAccounts, settings);
  }, [authAccounts, settings]);

  const loginWithOAuthApp = useCallback(
    async (data: AuthOptionsOAuthApp) => {
      const { authOptions, authCode } = await authGitHub(data);
      const { token, hostname } = await getToken(authCode, authOptions);
      const updatedAccounts = addAccount(
        authAccounts,
        'OAuth App',
        token,
        hostname,
      );
      setAuthAccounts(updatedAccounts);
      saveState(updatedAccounts, settings);
    },
    [authAccounts, settings],
  );

  const loginWithPersonalAccessToken = useCallback(
    async ({ token, hostname }: AuthOptionsPersonalAccessToken) => {
      await headNotifications(hostname, token);

      const user = await getUserData(token, hostname);
      const updatedAccounts = addAccount(
        authAccounts,
        'Personal Access Token',
        token,
        hostname,
        user,
      );
      setAuthAccounts(updatedAccounts);
      saveState(updatedAccounts, settings);
    },
    [authAccounts, settings],
  );

  const logout = useCallback(() => {
    setAuthAccounts(defaultAuthState);
    clearState();
  }, []);

  const restoreSettings = useCallback(() => {
    // Migrate authenticated accounts
    migrateAuthenticatedAccounts();

    const existing = loadState();

    if (existing.authAccounts) {
      setAuthAccounts({ ...defaultAuthState, ...existing.authAccounts });
    }

    if (existing.settings) {
      setSettings({ ...defaultSettings, ...existing.settings });
      return existing.settings;
    }
  }, []);

  const fetchNotificationsWithAccounts = useCallback(
    async () => await fetchNotifications(authAccounts, settings),
    [authAccounts, settings, notifications],
  );

  const markNotificationReadWithAccounts = useCallback(
    async (id: string, hostname: string) =>
      await markNotificationRead(authAccounts, settings, id, hostname),
    [authAccounts, notifications],
  );

  const markNotificationDoneWithAccounts = useCallback(
    async (id: string, hostname: string) =>
      await markNotificationDone(authAccounts, settings, id, hostname),
    [authAccounts, notifications],
  );

  const unsubscribeNotificationWithAccounts = useCallback(
    async (id: string, hostname: string) =>
      await unsubscribeNotification(authAccounts, settings, id, hostname),
    [authAccounts, notifications],
  );

  const markRepoNotificationsWithAccounts = useCallback(
    async (repoSlug: string, hostname: string) =>
      await markRepoNotifications(authAccounts, settings, repoSlug, hostname),
    [authAccounts, notifications],
  );

  const markRepoNotificationsDoneWithAccounts = useCallback(
    async (repoSlug: string, hostname: string) =>
      await markRepoNotificationsDone(
        authAccounts,
        settings,
        repoSlug,
        hostname,
      ),
    [authAccounts, notifications],
  );

  return (
    <AppContext.Provider
      value={{
        authAccounts,
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
