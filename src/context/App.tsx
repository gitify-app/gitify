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
  type AuthOptions,
  type AuthState,
  type AuthTokenOptions,
  type GitifyError,
  type SettingsState,
  type Status,
  Theme,
} from '../types';
import { headNotifications } from '../utils/api/client';
import { addAccount, authGitHub, getToken, getUserData } from '../utils/auth';
import { setAutoLaunch, updateTrayTitle } from '../utils/comms';
import Constants from '../utils/constants';
import { getNotificationCount } from '../utils/notifications';
import { clearState, loadState, saveState } from '../utils/storage';
import { setTheme } from '../utils/theme';

const defaultAccounts: AuthState = {
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
  accounts: AuthState;
  isLoggedIn: boolean;
  login: () => void;
  loginEnterprise: (data: AuthOptions) => void;
  validateToken: (data: AuthTokenOptions) => void;
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
  const [accounts, setAccounts] = useState<AuthState>(defaultAccounts);
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
    fetchNotifications(accounts, settings);
  }, [
    settings.participating,
    settings.showBots,
    settings.detailedNotifications,
    accounts.token,
    accounts.enterpriseAccounts.length,
  ]);

  useInterval(() => {
    fetchNotifications(accounts, settings);
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
      saveState(accounts, newSettings);
    },
    [accounts, settings],
  );

  const isLoggedIn = useMemo(() => {
    return !!accounts.token || accounts.enterpriseAccounts.length > 0;
  }, [accounts]);

  const login = useCallback(async () => {
    const { authCode } = await authGitHub();
    const { token } = await getToken(authCode);
    const hostname = Constants.DEFAULT_AUTH_OPTIONS.hostname;
    const user = await getUserData(token, hostname);
    const updatedAccounts = addAccount(accounts, token, hostname, user);
    setAccounts(updatedAccounts);
    saveState(updatedAccounts, settings);
  }, [accounts, settings]);

  const loginEnterprise = useCallback(
    async (data: AuthOptions) => {
      const { authOptions, authCode } = await authGitHub(data);
      const { token, hostname } = await getToken(authCode, authOptions);
      const updatedAccounts = addAccount(accounts, token, hostname);
      setAccounts(updatedAccounts);
      saveState(updatedAccounts, settings);
    },
    [accounts, settings],
  );

  const validateToken = useCallback(
    async ({ token, hostname }: AuthTokenOptions) => {
      await headNotifications(hostname, token);

      const user = await getUserData(token, hostname);
      const updatedAccounts = addAccount(accounts, token, hostname, user);
      setAccounts(updatedAccounts);
      saveState(updatedAccounts, settings);
    },
    [accounts, settings],
  );

  const logout = useCallback(() => {
    setAccounts(defaultAccounts);
    clearState();
  }, []);

  const restoreSettings = useCallback(() => {
    const existing = loadState();

    if (existing.accounts) {
      setAccounts({ ...defaultAccounts, ...existing.accounts });
    }

    if (existing.settings) {
      setSettings({ ...defaultSettings, ...existing.settings });
      return existing.settings;
    }
  }, []);

  const fetchNotificationsWithAccounts = useCallback(
    async () => await fetchNotifications(accounts, settings),
    [accounts, settings, notifications],
  );

  const markNotificationReadWithAccounts = useCallback(
    async (id: string, hostname: string) =>
      await markNotificationRead(accounts, settings, id, hostname),
    [accounts, notifications],
  );

  const markNotificationDoneWithAccounts = useCallback(
    async (id: string, hostname: string) =>
      await markNotificationDone(accounts, settings, id, hostname),
    [accounts, notifications],
  );

  const unsubscribeNotificationWithAccounts = useCallback(
    async (id: string, hostname: string) =>
      await unsubscribeNotification(accounts, settings, id, hostname),
    [accounts, notifications],
  );

  const markRepoNotificationsWithAccounts = useCallback(
    async (repoSlug: string, hostname: string) =>
      await markRepoNotifications(accounts, settings, repoSlug, hostname),
    [accounts, notifications],
  );

  const markRepoNotificationsDoneWithAccounts = useCallback(
    async (repoSlug: string, hostname: string) =>
      await markRepoNotificationsDone(accounts, settings, repoSlug, hostname),
    [accounts, notifications],
  );

  return (
    <AppContext.Provider
      value={{
        accounts,
        isLoggedIn,
        login,
        loginEnterprise,
        validateToken,
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
