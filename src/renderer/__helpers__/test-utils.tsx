import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { useMemo } from 'react';

import { BaseStyles, ThemeProvider } from '@primer/react';

import { mockAuth, mockSettings } from '../__mocks__/state-mocks';
import type { AppContextState } from '../context/App';
import { AppContext } from '../context/App';

/**
 * Props for the AppContextProvider wrapper
 */
interface AppContextProviderProps {
  readonly children: ReactNode;
  readonly value?: Partial<AppContextState>;
}

/**
 * Wrapper component that provides ThemeProvider, BaseStyles, and AppContext
 * with sensible defaults for testing.
 */
export function AppContextProvider({
  children,
  value = {},
}: AppContextProviderProps) {
  const defaultValue: Partial<AppContextState> = useMemo(() => {
    return {
      auth: mockAuth,
      isLoggedIn: false,
      loginWithGitHubApp: async () => {},
      loginWithOAuthApp: async () => {},
      loginWithPersonalAccessToken: async () => {},
      logoutFromAccount: async () => {},

      status: 'success',
      globalError: { title: '', descriptions: [], emojis: [] },

      notifications: [],
      notificationCount: 0,
      unreadNotificationCount: 0,
      hasNotifications: false,
      hasUnreadNotifications: false,

      fetchNotifications: async () => {},
      removeAccountNotifications: async () => {},

      markNotificationsAsRead: async () => {},
      markNotificationsAsDone: async () => {},
      unsubscribeNotification: async () => {},

      settings: mockSettings,
      clearFilters: () => {},
      resetSettings: () => {},
      updateSetting: () => {},
      updateFilter: () => {},

      ...value,
    } as Partial<AppContextState>;
  }, [value]);

  return (
    <ThemeProvider>
      <BaseStyles>
        <AppContext.Provider value={defaultValue}>
          {children}
        </AppContext.Provider>
      </BaseStyles>
    </ThemeProvider>
  );
}

/**
 * Custom render function that wraps components with AppContextProvider by default.
 *
 * Usage (simplified):
 *   renderWithAppContext(<MyComponent />, { auth, settings })
 *
 * Legacy (still supported):
 *   renderWithAppContext(<MyComponent />, { appContext: { auth, settings } })
 */
type RenderWithAppContextOptions = Omit<RenderOptions, 'wrapper'> &
  Partial<AppContextState> & {
    appContext?: Partial<AppContextState>;
  };

export function renderWithAppContext(
  ui: ReactElement,
  options: RenderWithAppContextOptions = {},
) {
  const CONTEXT_KEYS: Array<keyof AppContextState> = [
    'auth',
    'isLoggedIn',
    'loginWithGitHubApp',
    'loginWithOAuthApp',
    'loginWithPersonalAccessToken',
    'logoutFromAccount',
    'status',
    'globalError',
    'notifications',
    'notificationCount',
    'unreadNotificationCount',
    'hasNotifications',
    'hasUnreadNotifications',
    'fetchNotifications',
    'removeAccountNotifications',
    'markNotificationsAsRead',
    'markNotificationsAsDone',
    'unsubscribeNotification',
    'settings',
    'clearFilters',
    'resetSettings',
    'updateSetting',
    'updateFilter',
  ];

  const { appContext, ...rest } = options as Partial<
    Record<string, unknown>
  > & {
    appContext?: Partial<AppContextState>;
  };

  const ctxFromTopLevel: Partial<AppContextState> = {};
  for (const key of CONTEXT_KEYS) {
    if (key in rest && rest[key] !== undefined) {
      (ctxFromTopLevel as Partial<Record<string, unknown>>)[key] = rest[key];
    }
  }

  const value: Partial<AppContextState> = { ...ctxFromTopLevel };
  if (appContext) {
    Object.assign(value, appContext);
  }

  return render(ui, {
    wrapper: ({ children }) => (
      <AppContextProvider value={value}>{children}</AppContextProvider>
    ),
    // No additional render options by default
  });
}
