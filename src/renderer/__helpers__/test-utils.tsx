import { render } from '@testing-library/react';
import { type ReactElement, type ReactNode, useMemo } from 'react';

import { BaseStyles, ThemeProvider } from '@primer/react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AppContext, type AppContextState } from '../context/App';

export type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> };

const EMPTY_APP_CONTEXT: Partial<AppContextState> = {};

/**
 * Test context (settings removed as it's no longer in context)
 */
type TestAppContext = Partial<AppContextState>;

/**
 * Props for the AppContextProvider wrapper
 */
interface AppContextProviderProps {
  readonly children: ReactNode;
  readonly value?: TestAppContext;
}

/**
 * Wrapper component that provides ThemeProvider, BaseStyles, and AppContext
 * with sensible defaults for testing.
 */
function AppContextProvider({
  children,
  value = EMPTY_APP_CONTEXT,
}: AppContextProviderProps) {
  const defaultValue: AppContextState = useMemo(() => {
    return {
      notifications: [],
      notificationCount: 0,
      unreadNotificationCount: 0,
      hasNotifications: false,
      hasUnreadNotifications: false,

      status: 'success',
      globalError: null,

      // Default mock implementations for all required methods
      loginWithDeviceFlowStart: vi.fn(),
      loginWithDeviceFlowPoll: vi.fn(),
      loginWithDeviceFlowComplete: vi.fn(),
      loginWithOAuthApp: vi.fn(),
      loginWithPersonalAccessToken: vi.fn(),
      logoutFromAccount: vi.fn(),

      fetchNotifications: vi.fn(),
      removeAccountNotifications: vi.fn(),

      markNotificationsAsRead: vi.fn(),
      markNotificationsAsDone: vi.fn(),
      unsubscribeNotification: vi.fn(),

      ...value,
    } as AppContextState;
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
 * Custom render that wraps components with AppContextProvider by default.
 *
 * Usage:
 *   renderWithAppContext(<MyComponent />, { auth, settings, ... })
 */
export function renderWithAppContext(
  ui: ReactElement,
  context: Partial<AppContextState> = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        refetchInterval: false,
      },
    },
  });

  return render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <AppContextProvider value={context}>{children}</AppContextProvider>
      </QueryClientProvider>
    ),
  });
}

/**
 * Ensure stable snapshots for our randomized emoji use-cases
 */
export function ensureStableEmojis() {
  globalThis.Math.random = vi.fn(() => 0.1);
}
