import { render } from '@testing-library/react';
import { type ReactElement, type ReactNode, useMemo } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { BaseStyles, ThemeProvider } from '@primer/react';

import { AppContext, type AppContextState } from '../context/App';

export { navigateMock } from './vitest.setup';
export type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> };

const EMPTY_APP_CONTEXT: TestAppContext = {};

interface RenderOptions extends Partial<AppContextState> {
  initialEntries?: string[];
}

/**
 * Test context — only notification-related fields (auth/settings now come from stores).
 */
type TestAppContext = Partial<AppContextState>;

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
 *
 * Auth and settings state should be seeded via the Zustand stores before
 * rendering (vitest.setup.ts seeds defaults automatically).
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
      globalError: null,

      fetchNotifications: vi.fn(),
      removeAccountNotifications: vi.fn(),

      markNotificationsAsRead: vi.fn(),
      markNotificationsAsDone: vi.fn(),
      unsubscribeNotification: vi.fn(),

      ...value,
    } as TestAppContext;
  }, [value]);

  return (
    <MemoryRouter initialEntries={initialEntries}>
      <ThemeProvider>
        <BaseStyles>
          <AppContext.Provider value={defaultValue}>
            {children}
          </AppContext.Provider>
        </BaseStyles>
      </ThemeProvider>
    </MemoryRouter>
  );
}

/**
 * Custom render that wraps components with AppContextProvider by default.
 *
 * Usage:
 *   renderWithAppContext(<MyComponent />, { notifications, ... })
 */
export function renderWithAppContext(
  ui: ReactElement,
  { initialEntries, ...context }: RenderOptions = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AppContextProvider initialEntries={initialEntries} value={context}>
        {children}
      </AppContextProvider>
    ),
  });
}

/**
 * Ensure stable snapshots for our randomized emoji use-cases
 */
export function ensureStableEmojis() {
  globalThis.Math.random = vi.fn(() => 0.1);
}

