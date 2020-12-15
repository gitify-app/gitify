import React, {
  useState,
  createContext,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { useGitHubAuth } from '../hooks/useGitHubAuth';

import { Appearance, AuthState, SettingsState } from '../types';

const defaultAccounts: AuthState = {
  token: null,
  enterpriseAccounts: [],
};

const defaultSettings: SettingsState = {
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

  const updateSetting = useCallback((name: keyof SettingsState, value: any) => {
    setSettings({ ...settings, [name]: value });
  }, []);

  const isLoggedIn = useMemo(() => {
    return !!accounts.token || accounts.enterpriseAccounts.length > 0;
  }, [accounts]);

  const login = useCallback(async () => {
    const authCode = await authGitHub();
    const { token } = await getToken(authCode.code);
    setAccounts({ ...accounts, token });
  }, []);

  const logout = useCallback(() => {
    setAccounts(defaultAccounts);
  }, []);

  useEffect(() => {
    if (!accounts.token && !accounts.enterpriseAccounts) {
      // Empty local storage
    } else {
      // Save accounts to local storage
    }
  }, [accounts]);

  useEffect(() => {
    // Reload settings
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
