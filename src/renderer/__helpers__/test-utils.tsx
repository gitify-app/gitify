import { render } from '@testing-library/react';
import { type ReactElement, type ReactNode, useMemo } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { BaseStyles, ThemeProvider } from '@primer/react';

import { mockAuth, mockSettings } from '../__mocks__/state-mocks';

import { AppContext, type AppContextState } from '../context/App';

import { type FiltersStore, useFiltersStore } from '../stores';

export { navigateMock } from './vitest.setup';
export type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> };

const EMPTY_APP_CONTEXT: TestAppContext = {};

/**
 * Test context
 */
type TestAppContext = Partial<AppContextState>;

interface RenderOptions extends TestAppContext {
  initialEntries?: string[];
  filters?: Partial<FiltersStore>;
}

/**
 * Props for the AppContextProvider wrapper
 */
interface AppContextProviderProps {
  readonly children: ReactNode;
  readonly value?: TestAppContext;
  readonly initialEntries?: string[];
}

/**
 * Wrapper component that provides ThemeProvider, BaseStyles, and AppContext
 * with sensible defaults for testing.
 */
function AppContextProvider({
  children,
  value = EMPTY_APP_CONTEXT,
  initialEntries,
}: AppContextProviderProps) {
  const defaultValue: TestAppContext = useMemo(() => {
    return {
      auth: mockAuth,
      settings: mockSettings,
      isLoggedIn: true,

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

      clearFilters: vi.fn(),
      resetSettings: vi.fn(),
      updateSetting: vi.fn(),
      updateFilter: vi.fn(),

      ...value,
    } as TestAppContext;
  }, [value]);

  return (
    <MemoryRouter initialEntries={initialEntries}>
      <ThemeProvider>
        <BaseStyles>
          <AppContext.Provider value={defaultValue as AppContextState}>
            {children}
          </AppContext.Provider>
        </BaseStyles>
      </ThemeProvider>
    </MemoryRouter>
  );
}

/**
 * Custom render that wraps components with all providers needed for testing:
 * MemoryRouter, AppContext, and Zustand stores.
 *
 * Usage:
 *   renderWithProviders(<MyComponent />, { notifications, accounts, settings, filters, ... })
 */
export function renderWithProviders(
  ui: ReactElement,
  { initialEntries, filters, ...context }: RenderOptions = {},
) {
  if (filters) {
    useFiltersStore.setState(filters);
  }

  return render(ui, {
    wrapper: ({ children }) => (
      <AppContextProvider initialEntries={initialEntries} value={context}>
        {children}
      </AppContextProvider>
    ),
  });
}
