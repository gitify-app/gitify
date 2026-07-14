import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useTheme } from '@primer/react';

import { onlineManager, useQueryClient } from '@tanstack/react-query';

import { useAccounts } from '../hooks/useAccounts';
import { useNotifications } from '../hooks/useNotifications';
import {
  DEFAULT_SETTINGS_STATE,
  useAccountsStore,
  useFiltersStore,
  useSettingsStore,
} from '../stores';

import type { Account, Forge, Hostname, Token } from '../types';
import type {
  DeviceFlowSession,
  LoginOAuthWebOptions,
  LoginPersonalAccessTokenOptions,
} from '../utils/auth/types';

import { notificationsKeys } from '../utils/api/queryKeys';
import { getAdapter } from '../utils/forges/registry';
import { applyKeyboardShortcut, encryptValue } from '../utils/system/comms';
import { setTrayIconColorAndTitle } from '../utils/system/tray';
import {
  DEFAULT_DAY_COLOR_SCHEME,
  DEFAULT_DAY_HIGH_CONTRAST_COLOR_SCHEME,
  DEFAULT_NIGHT_COLOR_SCHEME,
  DEFAULT_NIGHT_HIGH_CONTRAST_COLOR_SCHEME,
  mapThemeModeToColorMode,
  mapThemeModeToColorScheme,
} from '../utils/ui/theme';
import { AppContext, type AppContextState } from './context';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  // Store actions and reset functions
  const resetAccounts = useAccountsStore((s) => s.reset);
  const resetFilters = useFiltersStore((s) => s.reset);
  const resetSettings = useSettingsStore((s) => s.reset);

  const accounts = useAccountsStore((s) => s.accounts);
  const createAccountInStore = useAccountsStore((s) => s.createAccount);
  const removeAccount = useAccountsStore((s) => s.removeAccount);

  /**
   * Create (or update) an account, then refetch notifications. Re-authenticating
   * an existing account keeps the same account count, so the notifications
   * query key does not change and the cache must be invalidated explicitly.
   */
  const createAccount = useCallback(
    async (...args: Parameters<typeof createAccountInStore>) => {
      await createAccountInStore(...args);

      await queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
    [createAccountInStore, queryClient],
  );

  // Subscribe to tray-related settings for useEffect dependencies
  const showNotificationsCountInTray = useSettingsStore((s) => s.showNotificationsCountInTray);
  const useUnreadActiveIcon = useSettingsStore((s) => s.useUnreadActiveIcon);
  const useAlternateIdleIcon = useSettingsStore((s) => s.useAlternateIdleIcon);

  // Subscribe to theme related settings for useEffect dependencies
  const theme = useSettingsStore((s) => s.theme);
  const increaseContrast = useSettingsStore((s) => s.increaseContrast);

  // Global keyboard shortcut settings
  const keyboardShortcut = useSettingsStore((s) => s.keyboardShortcut);
  const openGitifyShortcut = useSettingsStore((s) => s.openGitifyShortcut);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  const lastAppliedOpenGitifyShortcutRef = useRef(openGitifyShortcut);
  const [shortcutRegistrationError, setShortcutRegistrationError] = useState<string | null>(null);

  const clearShortcutRegistrationError = useCallback(() => {
    setShortcutRegistrationError(null);
  }, []);

  const { setColorMode, setDayScheme, setNightScheme } = useTheme();

  const [isOnline, setIsOnline] = useState(true);

  const {
    status,
    globalError,

    notifications,
    notificationCount,
    unreadNotificationCount,
    hasNotifications,
    hasUnreadNotifications,

    refetchNotifications,
    removeAccountNotifications,

    markNotificationsAsRead,
    markNotificationsAsDone,
    unsubscribeNotification,
  } = useNotifications();

  // Periodic account refreshes (startup + hourly interval)
  useAccounts();

  // Theme
  useEffect(() => {
    const colorMode = mapThemeModeToColorMode(theme);
    const colorScheme = mapThemeModeToColorScheme(theme, increaseContrast);

    setColorMode(colorMode);

    // When colorScheme is null (System theme), use appropriate fallbacks
    // based on whether high contrast is enabled
    const dayFallback = increaseContrast
      ? DEFAULT_DAY_HIGH_CONTRAST_COLOR_SCHEME
      : DEFAULT_DAY_COLOR_SCHEME;
    const nightFallback = increaseContrast
      ? DEFAULT_NIGHT_HIGH_CONTRAST_COLOR_SCHEME
      : DEFAULT_NIGHT_COLOR_SCHEME;

    setDayScheme(colorScheme ?? dayFallback);
    setNightScheme(colorScheme ?? nightFallback);
  }, [theme, increaseContrast, setColorMode, setDayScheme, setNightScheme]);

  // oxlint-disable-next-line react/exhaustive-deps -- We want to update the tray on setting or notification changes
  useEffect(() => {
    const trayCount = status === 'error' ? -1 : notificationCount;
    setTrayIconColorAndTitle(trayCount, isOnline);
  }, [
    showNotificationsCountInTray,
    useUnreadActiveIcon,
    useAlternateIdleIcon,
    status,
    notificationCount,
    isOnline,
  ]);

  // Global keyboard shortcut registration, reverting on failure
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await applyKeyboardShortcut({
        enabled: keyboardShortcut,
        accelerator: openGitifyShortcut,
      });

      if (cancelled) {
        return;
      }

      if (!result.success) {
        updateSetting('openGitifyShortcut', lastAppliedOpenGitifyShortcutRef.current);
        setShortcutRegistrationError(
          'This shortcut could not be registered. It may already be in use.',
        );
        return;
      }

      lastAppliedOpenGitifyShortcutRef.current = openGitifyShortcut;
      setShortcutRegistrationError(null);
    })();

    return () => {
      cancelled = true;
    };
  }, [keyboardShortcut, openGitifyShortcut, updateSetting]);

  useEffect(() => {
    window.gitify.onResetApp(() => {
      resetAccounts();
      resetSettings();
      resetFilters();
      queryClient.clear();
      lastAppliedOpenGitifyShortcutRef.current = DEFAULT_SETTINGS_STATE.openGitifyShortcut;
      setShortcutRegistrationError(null);
    });
  }, [resetAccounts, resetSettings, resetFilters, queryClient]);

  // Online / Offline status monitoring via TanStack Query onlineManager
  useEffect(() => {
    const handle = () => {
      setIsOnline(onlineManager.isOnline());
    };

    // Subscribe and call immediately to set initial status
    const unsubscribe = onlineManager.subscribe(handle);
    handle();

    return () => unsubscribe();
  }, []);

  /**
   * Initiate an OAuth device-flow session for the given forge.
   */
  const loginWithDeviceFlowStart = useCallback(
    async (forge: Forge, hostname?: Hostname, scopes?: string[]) => {
      const { deviceFlow } = getAdapter(forge);
      if (!deviceFlow) {
        throw new Error(`Device flow is not supported for forge "${forge}".`);
      }
      return await deviceFlow.start(hostname, scopes);
    },
    [],
  );

  /**
   * Poll for completion of an OAuth device-flow session.
   */
  const loginWithDeviceFlowPoll = useCallback(async (forge: Forge, session: DeviceFlowSession) => {
    const { deviceFlow } = getAdapter(forge);
    if (!deviceFlow) {
      throw new Error(`Device flow is not supported for forge "${forge}".`);
    }
    return await deviceFlow.poll(session);
  }, []);

  /**
   * Finalise an OAuth device-flow session by recording the account.
   */
  const loginWithDeviceFlowComplete = useCallback(
    async (forge: Forge, token: Token, hostname: Hostname) => {
      const { deviceFlow } = getAdapter(forge);
      if (!deviceFlow) {
        throw new Error(`Forge "${forge}" does not support device flow.`);
      }
      const method = deviceFlow.authMethod;

      const existingAccount = accounts.find((a) => a.hostname === hostname && a.method === method);
      if (existingAccount) {
        await removeAccountNotifications(existingAccount);
      }

      await createAccount(method, token, hostname, forge);
    },
    [accounts, createAccount, removeAccountNotifications],
  );

  /**
   * Login with a custom OAuth app on the given forge.
   */
  const loginWithOAuthApp = useCallback(
    async (forge: Forge, data: LoginOAuthWebOptions) => {
      const { oauthWebApp } = getAdapter(forge);
      if (!oauthWebApp) {
        throw new Error(`OAuth app login is not supported for forge "${forge}".`);
      }

      const { authOptions, authCode } = await oauthWebApp.performWebOAuth(data);
      const token = await oauthWebApp.exchangeAuthCodeForToken(authCode, authOptions);

      const existingAccount = accounts.find(
        (a) => a.hostname === authOptions.hostname && a.method === 'OAuth App',
      );
      if (existingAccount) {
        await removeAccountNotifications(existingAccount);
      }

      await createAccount('OAuth App', token, authOptions.hostname, forge);
    },
    [accounts, createAccount, removeAccountNotifications],
  );

  /**
   * Login with Personal Access Token (PAT).
   */
  const loginWithPersonalAccessToken = useCallback(
    async ({ token, hostname, forge }: LoginPersonalAccessTokenOptions) => {
      const resolvedForge: Forge = forge ?? 'github';
      const encryptedToken = (await encryptValue(token)) as Token;
      await getAdapter(resolvedForge).fetchAuthenticatedUser({
        forge: resolvedForge,
        hostname,
        token: encryptedToken,
      } as Account);

      const existingAccount = accounts.find(
        (a) =>
          a.hostname === hostname &&
          a.method === 'Personal Access Token' &&
          a.forge === resolvedForge,
      );
      if (existingAccount) {
        await removeAccountNotifications(existingAccount);
      }

      await createAccount('Personal Access Token', token, hostname, resolvedForge);
    },
    [accounts, createAccount, removeAccountNotifications],
  );

  const logoutFromAccount = useCallback(
    async (account: Account) => {
      await removeAccountNotifications(account);

      removeAccount(account);
    },
    [removeAccountNotifications, removeAccount],
  );

  const contextValues: AppContextState = useMemo(
    () => ({
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

      fetchNotifications: refetchNotifications,
      removeAccountNotifications,

      markNotificationsAsRead,
      markNotificationsAsDone,
      unsubscribeNotification,

      isOnline,

      shortcutRegistrationError,
      clearShortcutRegistrationError,
    }),
    [
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

      refetchNotifications,
      removeAccountNotifications,

      markNotificationsAsRead,
      markNotificationsAsDone,
      unsubscribeNotification,

      isOnline,

      shortcutRegistrationError,
      clearShortcutRegistrationError,
    ],
  );

  return <AppContext.Provider value={contextValues}>{children}</AppContext.Provider>;
};
