import React, {
  useState,
  createContext,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

import { Appearance, AuthState, SettingsState } from '../types';
import { clearState, loadState, saveState } from '../utils/storage';
import { setAppearance } from '../utils/appearance';
import { setAutoLaunch } from '../utils/comms';
import { useGitHubAuth } from '../hooks/useGitHubAuth';

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
  logout: () => void;

  settings: SettingsState;
  updateSetting: (name: keyof SettingsState, value: any) => void;
}

export const AppContext = createContext<Partial<AppContextState>>({});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [accounts, setAccounts] = useState<AuthState>(defaultAccounts);
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const { authGitHub, getToken } = useGitHubAuth();

  useEffect(() => {
    restoreSettings();
  }, []);

  const updateSetting = useCallback(
    (name: keyof SettingsState, value: boolean | Appearance) => {
      if (name === 'openAtStartup') {
        setAutoLaunch(value as boolean);
      }

      if (name === 'appearance') {
        setAppearance(value as Appearance);
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
    const authCode = await authGitHub();
    const { token } = await getToken(authCode.code);
    setAccounts({ ...accounts, token });
    saveState({ ...accounts, token }, settings);
  }, [accounts]);

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

  return (
    <AppContext.Provider
      value={{
        accounts,
        isLoggedIn,
        login,
        logout,

        settings,
        updateSetting,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
