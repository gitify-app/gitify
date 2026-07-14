import { render } from '@testing-library/react';
import { type ReactElement, type ReactNode, useMemo } from 'react';
import { type InitialEntry, MemoryRouter } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AppContext, type AppContextState } from '../context/context';
import { type FiltersStore, useAccountsStore, useFiltersStore, useSettingsStore } from '../stores';

import type { Account, SettingsState } from '../types';

export { navigateMock } from './vitest.setup';
export type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> };

const EMPTY_APP_CONTEXT: TestAppContext = {};

/**
 * Test context
 */
type TestAppContext = Partial<AppContextState>;

interface RenderOptions extends TestAppContext {
  /** Supports path strings or location objects (e.g. with `state` for re-auth). */
  initialEntries?: InitialEntry[];
  /** Seed the accounts store with these accounts. */
  accounts?: Account[];
  /** Seed the settings store with these settings. */
  settings?: Partial<SettingsState>;
  /** Seed the filters store. */
  filters?: Partial<FiltersStore>;
}

/**
 * Props for the AppContextProvider wrapper
 */
interface AppContextProviderProps {
  readonly children: ReactNode;
  readonly value?: TestAppContext;
  readonly initialEntries?: InitialEntry[];
}

/**
 * Wrapper component that provides MemoryRouter and AppContext
 * with sensible defaults for testing.
 */
function AppContextProvider({
  children,
  value = EMPTY_APP_CONTEXT,
  initialEntries,
}: AppContextProviderProps) {
  const defaultValue: TestAppContext = useMemo(() => {
    return {
      notifications: [],
      notificationCount: 0,
      unreadNotificationCount: 0,
      hasNotifications: false,
      hasUnreadNotifications: false,

      status: 'success',
      globalError: undefined,

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

      isOnline: true,

      shortcutRegistrationError: null,
      clearShortcutRegistrationError: vi.fn(),

      ...value,
    } as TestAppContext;
  }, [value]);

  return (
    <MemoryRouter initialEntries={initialEntries}>
      <AppContext.Provider value={defaultValue as AppContextState}>{children}</AppContext.Provider>
    </MemoryRouter>
  );
}

/**
 * Custom render that wraps components with all providers needed for testing:
 * MemoryRouter, QueryClientProvider, AppContext, and Zustand stores.
 *
 * Account and settings state is seeded directly into the Zustand stores;
 * the remaining options override the (slim) AppContext values.
 *
 * Usage:
 *   renderWithProviders(<MyComponent />, { notifications, accounts, settings, filters, ... })
 */
export function renderWithProviders(
  ui: ReactElement,
  { initialEntries, accounts, settings, filters, ...context }: RenderOptions = {},
) {
  if (accounts) {
    useAccountsStore.setState({ accounts });
  }

  if (settings) {
    useSettingsStore.setState(settings);
  }

  if (filters) {
    useFiltersStore.setState(filters);
  }

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
        <AppContextProvider initialEntries={initialEntries} value={context}>
          {children}
        </AppContextProvider>
      </QueryClientProvider>
    ),
  });
}
