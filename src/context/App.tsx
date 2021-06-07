import React, {
  useState,
  createContext,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

import {
  AccountNotifications,
  Appearance,
  AuthOptions,
  AuthState,
  AuthTokenOptions,
  SettingsState,
} from '../types';
import { apiRequestAuth } from '../utils/api-requests';
import { addAccount, authGitHub, getToken } from '../utils/auth';
import { clearState, loadState, saveState } from '../utils/storage';
import { setAppearance } from '../utils/appearance';
import { setAutoLaunch } from '../utils/comms';
import { useInterval } from '../hooks/useInterval';
import { useNotifications } from '../hooks/useNotifications';
import {generateGitHubAPIUrl} from "../utils/helpers";

const defaultAccounts: AuthState = {
  token: null,
  enterpriseAccounts: [],
};

export const defaultSettings: SettingsState = {
  participating: false,
  playSound: true,
  showNotifications: true,
  markOnClick: false,
  openAtStartup: false,
  appearance: Appearance.SYSTEM,
};

interface AppContextState {
  accounts: AuthState;
  isLoggedIn: boolean;
  login: () => void;
  loginEnterprise: (data: AuthOptions) => void;
  validateToken: (data: AuthTokenOptions) => void;
  logout: () => void;

  notifications: AccountNotifications[];
  isFetching: boolean;
  requestFailed: boolean;
  fetchNotifications: () => Promise<void>;
  markNotification: (id: string, hostname: string) => Promise<void>;
  unsubscribeNotification: (id: string, hostname: string) => Promise<void>;
  markRepoNotifications: (id: string, hostname: string) => Promise<void>;

  settings: SettingsState;
  updateSetting: (name: keyof SettingsState, value: any) => void;
}

export const AppContext = createContext<Partial<AppContextState>>({});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [accounts, setAccounts] = useState<AuthState>(defaultAccounts);
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const {
    fetchNotifications,
    notifications,
    requestFailed,
    isFetching,
    markNotification,
    unsubscribeNotification,
    markRepoNotifications,
  } = useNotifications();

  useEffect(() => {
    restoreSettings();
  }, []);

  useEffect(() => {
    setAppearance(settings.appearance as Appearance);
  }, [settings.appearance]);

  useEffect(() => {
    fetchNotifications(accounts, settings);
  }, [settings.participating]);

  useEffect(() => {
    fetchNotifications(accounts, settings);
  }, [accounts.token, accounts.enterpriseAccounts.length]);

  useInterval(() => {
    fetchNotifications(accounts, settings);
  }, 60000);

  const updateSetting = useCallback(
    (name: keyof SettingsState, value: boolean | Appearance) => {
      if (name === 'openAtStartup') {
        setAutoLaunch(value as boolean);
      }

      const newSettings = { ...settings, [name]: value };
      setSettings(newSettings);
      saveState(accounts, newSettings);
    },
    [accounts, settings]
  );

  const isLoggedIn = useMemo(() => {
    return !!accounts.token || accounts.enterpriseAccounts.length > 0;
  }, [accounts]);

  const login = useCallback(async () => {
    const { authCode } = await authGitHub();
    const { token } = await getToken(authCode);
    setAccounts({ ...accounts, token });
    saveState({ ...accounts, token }, settings);
  }, [accounts, settings]);

  const loginEnterprise = useCallback(
    async (data: AuthOptions) => {
      const { authOptions, authCode } = await authGitHub(data);
      const { token, hostname } = await getToken(authCode, authOptions);
      const updatedAccounts = addAccount(accounts, token, hostname);
      setAccounts(updatedAccounts);
      saveState(updatedAccounts, settings);
    },
    [accounts, settings]
  );

  const validateToken = useCallback(
   async ({token, hostname}: AuthTokenOptions) => {
     const url = generateGitHubAPIUrl(hostname) + "notifications";
     await apiRequestAuth(url, 'HEAD', token);
     const updatedAccounts = addAccount(accounts, token, hostname);
     setAccounts(updatedAccounts);
     saveState(updatedAccounts, settings);
   },
   [accounts, settings]
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
    }
  }, []);

  const fetchNotificationsWithAccounts = useCallback(
    async () => await fetchNotifications(accounts, settings),
    [accounts, settings, notifications]
  );

  const markNotificationWithAccounts = useCallback(
    async (id: string, hostname: string) =>
      await markNotification(accounts, id, hostname),
    [accounts, notifications]
  );

  const unsubscribeNotificationWithAccounts = useCallback(
    async (id: string, hostname: string) =>
      await unsubscribeNotification(accounts, id, hostname),
    [accounts, notifications]
  );

  const markRepoNotificationsWithAccounts = useCallback(
    async (repoSlug: string, hostname: string) =>
      await markRepoNotifications(accounts, repoSlug, hostname),
    [accounts, notifications]
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
        isFetching,
        requestFailed,
        fetchNotifications: fetchNotificationsWithAccounts,
        markNotification: markNotificationWithAccounts,
        unsubscribeNotification: unsubscribeNotificationWithAccounts,
        markRepoNotifications: markRepoNotificationsWithAccounts,

        settings,
        updateSetting,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
