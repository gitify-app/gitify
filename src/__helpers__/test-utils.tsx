import { render } from '@testing-library/react';
import { type ReactElement, type ReactNode, useMemo } from 'react';

import { BaseStyles, ThemeProvider } from '@primer/react';

import { mockAuth, mockSettings } from '../__mocks__/state-mocks';
import { AppContext, type AppContextState } from '../context/App';

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
      settings: mockSettings,
      isLoggedIn: true,

      notifications: [],

      status: 'success',
      globalError: null,

      // Required by useAppContext
      fetchNotifications: vi.fn(),

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
