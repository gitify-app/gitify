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

      status: 'success',
      globalError: null,

      settings: mockSettings,

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
  const value: Partial<AppContextState> = { ...context };

  return render(ui, {
    wrapper: ({ children }) => (
      <AppContextProvider value={value}>{children}</AppContextProvider>
    ),
  });
}
