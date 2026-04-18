import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useTheme } from '@primer/react';

import { Constants } from '../constants';

import { useInactivityTimer } from '../hooks/timers/useInactivityTimer';
import { useIntervalTimer } from '../hooks/timers/useIntervalTimer';
import { useNotifications } from '../hooks/useNotifications';
import { useFiltersStore } from '../stores';

import type {
  Account,
  AccountNotifications,
  AuthState,
  Forge,
  GitifyError,
  GitifyNotification,
  Hostname,
  SettingsState,
  SettingsValue,
  Status,
  Token,
} from '../types';
import { FetchType } from '../types';
import type {
  DeviceFlowSession,
  LoginOAuthWebOptions,
  LoginPersonalAccessTokenOptions,
} from '../utils/auth/types';

import { fetchAuthenticatedUserDetails } from '../utils/api/client';
import { clearOctokitClientCache } from '../utils/api/octokit';
import {
  exchangeAuthCodeForAccessToken,
  performGitHubWebOAuth,
  pollGitHubDeviceFlow,
  startGitHubDeviceFlow,
} from '../utils/auth/flows';
import {
  addAccount,
  getAccountUUID,
  hasAccounts,
  refreshAccount,
  removeAccount,
} from '../utils/auth/utils';
import { clearState, loadState, saveState } from '../utils/core/storage';
import {
  applyKeyboardShortcut,
  decryptValue,
  encryptValue,
  setAutoLaunch,
  setUseAlternateIdleIcon,
  setUseUnreadActiveIcon,
} from '../utils/system/comms';
import { setTrayIconColorAndTitle } from '../utils/system/tray';
import {
  DEFAULT_DAY_COLOR_SCHEME,
  DEFAULT_DAY_HIGH_CONTRAST_COLOR_SCHEME,
  DEFAULT_NIGHT_COLOR_SCHEME,
  DEFAULT_NIGHT_HIGH_CONTRAST_COLOR_SCHEME,
  mapThemeModeToColorMode,
  mapThemeModeToColorScheme,
} from '../utils/ui/theme';
import { zoomLevelToPercentage, zoomPercentageToLevel } from '../utils/ui/zoom';
import { defaultAuth, defaultSettings } from './defaults';

function normalizeAuthState(auth: AuthState): AuthState {
  return {
    accounts: auth.accounts.map((a) => ({
      ...a,
      forge: a.forge ?? ('github' as Forge),
    })),
  };
}

export interface AppContextState {
  auth: AuthState;
  isLoggedIn: boolean;
  loginWithDeviceFlowStart: (
    hostname?: Hostname,
    scopes?: string[],
  ) => Promise<DeviceFlowSession>;
  loginWithDeviceFlowPoll: (
    session: DeviceFlowSession,
  ) => Promise<Token | null>;
  loginWithDeviceFlowComplete: (
    token: Token,
    hostname: Hostname,
  ) => Promise<void>;
  loginWithOAuthApp: (data: LoginOAuthWebOptions) => Promise<void>;
  loginWithPersonalAccessToken: (
    data: LoginPersonalAccessTokenOptions,
  ) => Promise<void>;
  logoutFromAccount: (account: Account) => Promise<void>;

  status: Status;
  globalError: GitifyError | undefined;

  notifications: AccountNotifications[];
  notificationCount: number;
  unreadNotificationCount: number;
  hasNotifications: boolean;
  hasUnreadNotifications: boolean;

  fetchNotifications: () => Promise<void>;
  removeAccountNotifications: (account: Account) => Promise<void>;

  markNotificationsAsRead: (
    notifications: GitifyNotification[],
  ) => Promise<void>;
  markNotificationsAsDone: (
    notifications: GitifyNotification[],
  ) => Promise<void>;
  unsubscribeNotification: (notification: GitifyNotification) => Promise<void>;

  settings: SettingsState;
  resetSettings: () => void;
  updateSetting: (name: keyof SettingsState, value: SettingsValue) => void;

  /** Shown when the OS could not register the chosen global shortcut. */
  shortcutRegistrationError: string | null;
  clearShortcutRegistrationError: () => void;
}

export const AppContext = createContext<Partial<AppContextState> | undefined>(
  undefined,
);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const existingState = loadState();

  const [auth, setAuth] = useState<AuthState>(
    existingState.auth
      ? { ...defaultAuth, ...normalizeAuthState(existingState.auth) }
      : defaultAuth,
  );

  const [settings, setSettings] = useState<SettingsState>(
    existingState.settings
      ? { ...defaultSettings, ...existingState.settings }
      : defaultSettings,
  );

  const lastAppliedOpenGitifyShortcutRef = useRef(settings.openGitifyShortcut);
  const [shortcutRegistrationError, setShortcutRegistrationError] = useState<
    string | null
  >(null);

  const clearShortcutRegistrationError = useCallback(() => {
    setShortcutRegistrationError(null);
  }, []);

  const { setColorMode, setDayScheme, setNightScheme } = useTheme();

  const {
    status,
    globalError,

    notifications,
    notificationCount,
    unreadNotificationCount,
    hasNotifications,
    hasUnreadNotifications,

    fetchNotifications,
    removeAccountNotifications,

    markNotificationsAsRead,
    markNotificationsAsDone,
    unsubscribeNotification,
  } = useNotifications();

  const includeSearchTokens = useFiltersStore((s) => s.includeSearchTokens);
  const excludeSearchTokens = useFiltersStore((s) => s.excludeSearchTokens);
  const userTypes = useFiltersStore((s) => s.userTypes);
  const subjectTypes = useFiltersStore((s) => s.subjectTypes);
  const states = useFiltersStore((s) => s.states);
  const reasons = useFiltersStore((s) => s.reasons);

  const persistAuth = useCallback(
    (nextAuth: AuthState) => {
      setAuth(nextAuth);
      saveState({ auth: nextAuth, settings });
    },
    [settings],
  );

  const refreshAllAccounts = useCallback(async () => {
    if (!auth.accounts.length) {
      return;
    }

    const refreshedAccounts = await Promise.all(
      auth.accounts.map((account) => refreshAccount(account)),
    );

    const updatedAuth: AuthState = {
      ...auth,
      accounts: refreshedAccounts,
    };

    persistAuth(updatedAuth);
  }, [auth, persistAuth]);

  // TODO - Remove migration logic in future release
  const migrateAuthTokens = useCallback(async () => {
    const migratedAccounts = await Promise.all(
      auth.accounts.map(async (account) => {
        try {
          await decryptValue(account.token);
          return account;
        } catch {
          const encryptedToken = (await encryptValue(account.token)) as Token;
          return { ...account, token: encryptedToken };
        }
      }),
    );

    const tokensMigrated = migratedAccounts.some((migratedAccount) => {
      const originalAccount = auth.accounts.find(
        (account) =>
          getAccountUUID(account) === getAccountUUID(migratedAccount),
      );

      if (!originalAccount) {
        return true;
      }

      return migratedAccount.token !== originalAccount.token;
    });

    if (!tokensMigrated) {
      return;
    }

    const updatedAuth: AuthState = {
      ...auth,
      accounts: migratedAccounts,
    };

    persistAuth(updatedAuth);
  }, [auth, persistAuth]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Fetch new notifications when account count or filters change
  useEffect(() => {
    fetchNotifications({ auth, settings });
  }, [
    auth.accounts.length,
    settings.participating,
    includeSearchTokens,
    excludeSearchTokens,
    userTypes,
    subjectTypes,
    states,
    reasons,
  ]);

  useIntervalTimer(
    () => {
      fetchNotifications({ auth, settings });
    },
    settings.fetchType === FetchType.INTERVAL ? settings.fetchInterval : null,
  );

  useInactivityTimer(
    () => {
      fetchNotifications({ auth, settings });
    },
    settings.fetchType === FetchType.INACTIVITY ? settings.fetchInterval : null,
  );

  /**
   * On startup, check if auth tokens need encrypting and refresh all account details
   */
  // biome-ignore lint/correctness/useExhaustiveDependencies: Run once on startup
  useEffect(() => {
    void (async () => {
      await migrateAuthTokens();
      await refreshAllAccounts();
    })();
  }, []);

  // Refresh account details on interval
  useIntervalTimer(() => {
    refreshAllAccounts();
  }, Constants.REFRESH_ACCOUNTS_INTERVAL_MS);

  // Theme
  useEffect(() => {
    const colorMode = mapThemeModeToColorMode(settings.theme);
    const colorScheme = mapThemeModeToColorScheme(
      settings.theme,
      settings.increaseContrast,
    );

    setColorMode(colorMode);

    // When colorScheme is null (System theme), use appropriate fallbacks
    // based on whether high contrast is enabled
    const dayFallback = settings.increaseContrast
      ? DEFAULT_DAY_HIGH_CONTRAST_COLOR_SCHEME
      : DEFAULT_DAY_COLOR_SCHEME;
    const nightFallback = settings.increaseContrast
      ? DEFAULT_NIGHT_HIGH_CONTRAST_COLOR_SCHEME
      : DEFAULT_NIGHT_COLOR_SCHEME;

    setDayScheme(colorScheme ?? dayFallback);
    setNightScheme(colorScheme ?? nightFallback);
  }, [
    settings.theme,
    settings.increaseContrast,
    setColorMode,
    setDayScheme,
    setNightScheme,
  ]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: We want to update the tray on setting or notification changes
  useEffect(() => {
    setUseUnreadActiveIcon(settings.useUnreadActiveIcon);
    setUseAlternateIdleIcon(settings.useAlternateIdleIcon);

    const trayCount = status === 'error' ? -1 : notificationCount;
    setTrayIconColorAndTitle(trayCount, settings);
  }, [
    settings.showNotificationsCountInTray,
    settings.useUnreadActiveIcon,
    settings.useAlternateIdleIcon,
    notifications,
  ]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await applyKeyboardShortcut({
        enabled: settings.keyboardShortcut,
        accelerator: settings.openGitifyShortcut,
      });

      if (cancelled) {
        return;
      }

      if (!result.success) {
        setSettings((prev) => {
          const reverted = {
            ...prev,
            openGitifyShortcut: lastAppliedOpenGitifyShortcutRef.current,
          };
          saveState({ auth, settings: reverted });
          return reverted;
        });
        setShortcutRegistrationError(
          'This shortcut could not be registered. It may already be in use.',
        );
        return;
      }

      lastAppliedOpenGitifyShortcutRef.current = settings.openGitifyShortcut;
      setShortcutRegistrationError(null);
    })();

    return () => {
      cancelled = true;
    };
  }, [auth, settings.keyboardShortcut, settings.openGitifyShortcut]);

  useEffect(() => {
    setAutoLaunch(settings.openAtStartup);
  }, [settings.openAtStartup]);

  useEffect(() => {
    window.gitify.onResetApp(() => {
      clearState();
      setAuth(defaultAuth);
      setSettings(defaultSettings);
      lastAppliedOpenGitifyShortcutRef.current =
        defaultSettings.openGitifyShortcut;
      setShortcutRegistrationError(null);
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(() => {
      saveState({ auth, settings: defaultSettings });
      return defaultSettings;
    });
    lastAppliedOpenGitifyShortcutRef.current =
      defaultSettings.openGitifyShortcut;
    setShortcutRegistrationError(null);
  }, [auth]);

  const updateSetting = useCallback(
    (name: keyof SettingsState, value: SettingsValue) => {
      setSettings((prevSettings) => {
        const newSettings = { ...prevSettings, [name]: value };
        saveState({ auth, settings: newSettings });
        return newSettings;
      });
    },
    [auth],
  );

  // Global window zoom handler / listener
  // biome-ignore lint/correctness/useExhaustiveDependencies: We want to update on settings.zoomPercentage changes
  useEffect(() => {
    // Set the zoom level when settings.zoomPercentage changes
    window.gitify.zoom.setLevel(zoomPercentageToLevel(settings.zoomPercentage));

    // Sync zoom percentage in settings when window is resized
    let timeout: NodeJS.Timeout;
    const DELAY = 200;

    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const zoomPercentage = zoomLevelToPercentage(
          window.gitify.zoom.getLevel(),
        );

        if (zoomPercentage !== settings.zoomPercentage) {
          updateSetting('zoomPercentage', zoomPercentage);
        }
      }, DELAY);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeout);
    };
  }, [settings.zoomPercentage]);

  const isLoggedIn = useMemo(() => {
    return hasAccounts(auth);
  }, [auth]);

  /**
   * Login to GitHub Gitify OAuth App.
   *
   * Initiate device flow session.
   */
  const loginWithDeviceFlowStart = useCallback(
    async (hostname?: Hostname, scopes?: string[]) =>
      await startGitHubDeviceFlow(hostname, scopes),
    [],
  );

  /**
   * Login to GitHub Gitify OAuth App.
   *
   * Poll for device flow session.
   */
  const loginWithDeviceFlowPoll = useCallback(
    async (session: DeviceFlowSession) => await pollGitHubDeviceFlow(session),
    [],
  );

  /**
   * Login to GitHub Gitify OAuth App.
   *
   * Finalize device flow session.
   */
  const loginWithDeviceFlowComplete = useCallback(
    async (token: Token, hostname: Hostname) => {
      const existingAccount = auth.accounts.find(
        (a) => a.hostname === hostname && a.method === 'GitHub App',
      );
      if (existingAccount) {
        await removeAccountNotifications(existingAccount);
      }

      const updatedAuth = await addAccount(
        auth,
        'GitHub App',
        token,
        hostname,
        'github',
      );

      persistAuth(updatedAuth);
      await fetchNotifications({ auth: updatedAuth, settings });
    },
    [
      auth,
      settings,
      persistAuth,
      fetchNotifications,
      removeAccountNotifications,
    ],
  );

  /**
   * Login with custom GitHub OAuth App.
   */
  const loginWithOAuthApp = useCallback(
    async (data: LoginOAuthWebOptions) => {
      const { authOptions, authCode } = await performGitHubWebOAuth(data);
      const token = await exchangeAuthCodeForAccessToken(authCode, authOptions);

      const existingAccount = auth.accounts.find(
        (a) => a.hostname === authOptions.hostname && a.method === 'OAuth App',
      );
      if (existingAccount) {
        await removeAccountNotifications(existingAccount);
      }

      const updatedAuth = await addAccount(
        auth,
        'OAuth App',
        token,
        authOptions.hostname,
        'github',
      );

      persistAuth(updatedAuth);
      await fetchNotifications({ auth: updatedAuth, settings });
    },
    [
      auth,
      settings,
      persistAuth,
      fetchNotifications,
      removeAccountNotifications,
    ],
  );

  /**
   * Login with Personal Access Token (PAT).
   */
  const loginWithPersonalAccessToken = useCallback(
    async ({ token, hostname, forge }: LoginPersonalAccessTokenOptions) => {
      const resolvedForge: Forge = forge ?? 'github';
      const encryptedToken = (await encryptValue(token)) as Token;
      await fetchAuthenticatedUserDetails({
        hostname,
        token: encryptedToken,
        forge: resolvedForge,
      } as Account);

      const existingAccount = auth.accounts.find(
        (a) =>
          a.hostname === hostname &&
          a.method === 'Personal Access Token' &&
          (a.forge ?? 'github') === resolvedForge,
      );
      if (existingAccount) {
        await removeAccountNotifications(existingAccount);
      }

      const updatedAuth = await addAccount(
        auth,
        'Personal Access Token',
        token,
        hostname,
        resolvedForge,
      );

      persistAuth(updatedAuth);
      await fetchNotifications({ auth: updatedAuth, settings });
    },
    [
      auth,
      settings,
      persistAuth,
      fetchNotifications,
      removeAccountNotifications,
    ],
  );

  const logoutFromAccount = useCallback(
    async (account: Account) => {
      removeAccountNotifications(account);

      const updatedAuth = removeAccount(auth, account);

      // Clear Octokit client cache when removing account
      clearOctokitClientCache();

      persistAuth(updatedAuth);
    },
    [auth, removeAccountNotifications, persistAuth],
  );

  const fetchNotificationsWithAccounts = useCallback(
    async () => await fetchNotifications({ auth, settings }),
    [auth, settings, fetchNotifications],
  );

  const markNotificationsAsReadWithAccounts = useCallback(
    async (notifications: GitifyNotification[]) =>
      await markNotificationsAsRead({ auth, settings }, notifications),
    [auth, settings, markNotificationsAsRead],
  );

  const markNotificationsAsDoneWithAccounts = useCallback(
    async (notifications: GitifyNotification[]) =>
      await markNotificationsAsDone({ auth, settings }, notifications),
    [auth, settings, markNotificationsAsDone],
  );

  const unsubscribeNotificationWithAccounts = useCallback(
    async (notification: GitifyNotification) =>
      await unsubscribeNotification({ auth, settings }, notification),
    [auth, settings, unsubscribeNotification],
  );

  const contextValues: AppContextState = useMemo(
    () => ({
      auth,
      isLoggedIn,
      loginWithDeviceFlowStart,
      loginWithDeviceFlowPoll,
      loginWithDeviceFlowComplete,
      loginWithOAuthApp,
      loginWithPersonalAccessToken,
      logoutFromAccount,

      status,
      globalError,

      notifications,
      notificationCount,
      unreadNotificationCount,
      hasNotifications,
      hasUnreadNotifications,

      fetchNotifications: fetchNotificationsWithAccounts,
      removeAccountNotifications,

      markNotificationsAsRead: markNotificationsAsReadWithAccounts,
      markNotificationsAsDone: markNotificationsAsDoneWithAccounts,
      unsubscribeNotification: unsubscribeNotificationWithAccounts,

      settings,
      resetSettings,
      updateSetting,

      shortcutRegistrationError,
      clearShortcutRegistrationError,
    }),
    [
      auth,
      isLoggedIn,
      loginWithDeviceFlowStart,
      loginWithDeviceFlowPoll,
      loginWithDeviceFlowComplete,
      loginWithOAuthApp,
      loginWithPersonalAccessToken,
      logoutFromAccount,

      status,
      globalError,

      notifications,
      notificationCount,
      unreadNotificationCount,
      hasNotifications,
      hasUnreadNotifications,

      fetchNotificationsWithAccounts,
      removeAccountNotifications,

      markNotificationsAsReadWithAccounts,
      markNotificationsAsDoneWithAccounts,
      unsubscribeNotificationWithAccounts,

      settings,
      resetSettings,
      updateSetting,

      shortcutRegistrationError,
      clearShortcutRegistrationError,
    ],
  );

  return (
    <AppContext.Provider value={contextValues}>{children}</AppContext.Provider>
  );
};
