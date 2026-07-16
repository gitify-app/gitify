import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { type InitialEntry, MemoryRouter } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useShortcutRegistrationStore } from '../hooks/useShortcutRegistration';
import { type FiltersStore, useAccountsStore, useFiltersStore, useSettingsStore } from '../stores';

import type { Account, SettingsState } from '../types';

import {
  type LoginsState,
  type NotificationsState,
  setIsOnlineOverride,
  setLoginsOverrides,
  setNotificationsOverrides,
} from './hook-mocks';

export { navigateMock } from './vitest.setup';
export type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> };

interface RenderOptions extends Partial<NotificationsState>, Partial<LoginsState> {
  /** Supports path strings or location objects (e.g. with `state` for re-auth). */
  initialEntries?: InitialEntry[];
  /** Seed the accounts store with these accounts. */
  accounts?: Account[];
  /** Seed the settings store with these settings. */
  settings?: Partial<SettingsState>;
  /** Seed the filters store. */
  filters?: Partial<FiltersStore>;
  /** Override the mocked `useNotifications().refetchNotifications`. */
  fetchNotifications?: NotificationsState['refetchNotifications'];
  /** Override the mocked online status. */
  isOnline?: boolean;
  /** Seed the shortcut registration error state. */
  shortcutRegistrationError?: string | null;
}

const LOGIN_KEYS = [
  'loginWithDeviceFlowStart',
  'loginWithDeviceFlowPoll',
  'loginWithDeviceFlowComplete',
  'loginWithOAuthApp',
  'loginWithPersonalAccessToken',
  'logoutFromAccount',
] as const;

/**
 * Custom render that wraps components with all providers needed for testing:
 * MemoryRouter, QueryClientProvider, and Zustand stores.
 *
 * Account, settings, and filter state is seeded directly into the Zustand
 * stores; the remaining options override the globally mocked `useNotifications`,
 * `useLogins`, and `useOnlineStatus` hooks (see hook-mocks.ts).
 *
 * Usage:
 *   renderWithProviders(<MyComponent />, { notifications, accounts, settings, filters, ... })
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    initialEntries,
    accounts,
    settings,
    filters,
    fetchNotifications,
    isOnline,
    shortcutRegistrationError,
    ...hookOverrides
  }: RenderOptions = {},
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

  if (isOnline !== undefined) {
    setIsOnlineOverride(isOnline);
  }

  if (shortcutRegistrationError !== undefined) {
    useShortcutRegistrationStore.getState().setShortcutRegistrationError(shortcutRegistrationError);
  }

  const loginsOverrides: Partial<LoginsState> = {};
  const notificationsOverrides: Partial<NotificationsState> = {};

  for (const [key, value] of Object.entries(hookOverrides)) {
    if ((LOGIN_KEYS as readonly string[]).includes(key)) {
      loginsOverrides[key as keyof LoginsState] = value as never;
    } else {
      notificationsOverrides[key as keyof NotificationsState] = value as never;
    }
  }

  if (fetchNotifications) {
    notificationsOverrides.refetchNotifications = fetchNotifications;
  }

  setNotificationsOverrides(notificationsOverrides);
  setLoginsOverrides(loginsOverrides);

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
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </QueryClientProvider>
    ),
  });
}
