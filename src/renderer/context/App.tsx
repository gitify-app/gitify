import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { useTheme } from '@primer/react';

import { Constants } from '../constants';

import { useInactivityTimer } from '../hooks/timers/useInactivityTimer';
import { useIntervalTimer } from '../hooks/timers/useIntervalTimer';
import { useNotifications } from '../hooks/useNotifications';

import type {
  Account,
  AccountNotifications,
  AuthState,
  GitifyError,
  GitifyNotification,
  Status,
  Token,
} from '../types';
import { FetchType } from '../types';

import {
  useAccountsStore,
  useFiltersStore,
  useSettingsStore,
} from '../stores';
import { getAccountUUID, refreshAccount } from '../utils/auth/utils';
import { clearState } from '../utils/core/storage';
import {
  decryptValue,
  encryptValue,
  setAutoLaunch,
  setKeyboardShortcut,
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

export interface AppContextState {
  status: Status;
  globalError: GitifyError;

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
}

export const AppContext = createContext<Partial<AppContextState> | undefined>(
  undefined,
);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const accounts = useAccountsStore((s) => s.accounts);
  const auth: AuthState = useMemo(() => ({ accounts }), [accounts]);

  const settings = useSettingsStore();

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

  // Track previous accounts to detect removals and clean up notifications
  const prevAccountsRef = useRef<Account[]>(accounts);
  useEffect(() => {
    const prev = prevAccountsRef.current;
    prevAccountsRef.current = accounts;

    const removedAccounts = prev.filter(
      (prevAccount) =>
        !accounts.some(
          (a) => getAccountUUID(a) === getAccountUUID(prevAccount),
        ),
    );

    for (const removed of removedAccounts) {
      removeAccountNotifications(removed);
    }
  }, [accounts, removeAccountNotifications]);

  const refreshAllAccounts = useCallback(async () => {
    const currentAccounts = useAccountsStore.getState().accounts;
    if (!currentAccounts.length) {
      return;
    }

    const refreshedAccounts = await Promise.all(
      currentAccounts.map((account) => refreshAccount(account)),
    );

    useAccountsStore.setState({ accounts: refreshedAccounts });
  }, []);

  // TODO - Remove migration logic in future release
  const migrateAuthTokens = useCallback(async () => {
    const currentAccounts = useAccountsStore.getState().accounts;
    const migratedAccounts = await Promise.all(
      currentAccounts.map(async (account) => {
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
      const originalAccount = currentAccounts.find(
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

    useAccountsStore.setState({ accounts: migratedAccounts });
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Fetch new notifications when account count or filters change
  useEffect(() => {
    fetchNotifications({ auth, settings });
  }, [
    accounts.length,
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
    setKeyboardShortcut(settings.keyboardShortcut);
  }, [settings.keyboardShortcut]);

  useEffect(() => {
    setAutoLaunch(settings.openAtStartup);
  }, [settings.openAtStartup]);

  useEffect(() => {
    window.gitify.onResetApp(() => {
      useAccountsStore.getState().reset();
      useSettingsStore.getState().resetSettings();
      clearState();
    });
  }, []);

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
          useSettingsStore
            .getState()
            .updateSetting('zoomPercentage', zoomPercentage);
        }
      }, DELAY);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeout);
    };
  }, [settings.zoomPercentage]);

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
    }),
    [
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
    ],
  );

  return (
    <AppContext.Provider value={contextValues}>{children}</AppContext.Provider>
  );
};
