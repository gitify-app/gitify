import { render } from '@testing-library/react';
import { type ReactElement, type ReactNode, useMemo } from 'react';

import { BaseStyles, ThemeProvider } from '@primer/react';

import { mockAuth, mockSettings } from '../__mocks__/state-mocks';

import { AppContext, type AppContextState } from '../context/App';

export type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> };

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
function AppContextProvider({ children, value = {} }: AppContextProviderProps) {
  const defaultValue: AppContextState = useMemo(() => {
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
      loginWithDeviceFlowStart: jest.fn(),
      loginWithDeviceFlowPoll: jest.fn(),
      loginWithDeviceFlowComplete: jest.fn(),
      loginWithOAuthApp: jest.fn(),
      loginWithPersonalAccessToken: jest.fn(),
      logoutFromAccount: jest.fn(),

      fetchNotifications: jest.fn(),
      removeAccountNotifications: jest.fn(),

      markNotificationsAsRead: jest.fn(),
      markNotificationsAsDone: jest.fn(),
      unsubscribeNotification: jest.fn(),

      clearFilters: jest.fn(),
      resetSettings: jest.fn(),
      updateSetting: jest.fn(),
      updateFilter: jest.fn(),

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
  return render(ui, {
    wrapper: ({ children }) => (
      <AppContextProvider value={context}>{children}</AppContextProvider>
    ),
  });
}

/**
 * Ensure stable snapshots for our randomized emoji use-cases
 */
export function ensureStableEmojis() {
  globalThis.Math.random = vi.fn(() => 0.1);
}
