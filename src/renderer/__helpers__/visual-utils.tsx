import { render, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import { type InitialEntry, MemoryRouter } from 'react-router-dom';

import { BaseStyles } from '@primer/react';
import { ThemeProvider } from '@primer/react/next';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useAppearance } from '../hooks/useAppearance';
import { type FiltersStore, useAccountsStore, useFiltersStore, useSettingsStore } from '../stores';

import { AppLayout } from '../components/layout/AppLayout';

import type { Account, AccountNotifications, DesignLanguage, SettingsState, Theme } from '../types';

import { setNotificationsOverrides } from './hook-mocks';
import '../App.css';
import { stubImage } from './visual.setup';

const AVATAR_STUB = stubImage('#57606a');

export interface VisualRenderOptions {
  /** Colour scheme to screenshot under. */
  theme: Theme;
  /** Design language to screenshot under. */
  designLanguage: DesignLanguage;
  initialEntries?: InitialEntry[];
  accounts?: Account[];
  settings?: Partial<SettingsState>;
  filters?: Partial<FiltersStore>;
  notifications?: AccountNotifications[];
}

/**
 * Rewrites every remote avatar in a fixture tree to an inline SVG. These would
 * otherwise be fetched from githubusercontent during the run, making baselines
 * depend on the network and on whatever that URL serves today.
 *
 * Matches on the key name rather than an exact list because the fixtures spell
 * it both `avatar` (`GitifyUser`) and `avatarUrl` (`GitifyNotificationUser`).
 */
function isRemoteAvatar(key: string, value: unknown): boolean {
  return (
    key.toLowerCase().includes('avatar') && typeof value === 'string' && /^https?:\/\//.test(value)
  );
}

function withStubbedAvatars<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(withStubbedAvatars) as T;
  }

  if (value === null || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      isRemoteAvatar(key, item) ? AVATAR_STUB : withStubbedAvatars(item),
    ]),
  ) as T;
}

/** Applies the theme side effects that `GlobalEffects` owns in the real app. */
function Appearance() {
  useAppearance();
  return null;
}

/**
 * Renders a route inside the full app chrome (Primer theme, sidebar, layout) at
 * the menubar window size.
 *
 * Not wrapped in `act()`: `render` already applies its own, and awaiting this
 * call yields long enough for the async effects to land (`EmojiText` fills its
 * `innerHTML` from a promise). `toMatchScreenshot` retries until the page is
 * stable anyway, so it is the backstop rather than this function.
 */
export function renderRoute(
  ui: ReactElement,
  {
    theme,
    designLanguage,
    initialEntries,
    accounts,
    settings,
    filters,
    notifications,
  }: VisualRenderOptions,
) {
  useSettingsStore.setState({ ...settings, theme, designLanguage });

  if (accounts) {
    useAccountsStore.setState({ accounts: withStubbedAvatars(accounts) });
  }

  if (filters) {
    useFiltersStore.setState(filters);
  }

  if (notifications) {
    const stubbed = withStubbedAvatars(notifications);
    setNotificationsOverrides({
      notifications: stubbed,
      notificationCount: stubbed.reduce((sum, n) => sum + n.notifications.length, 0),
      hasNotifications: stubbed.some((n) => n.notifications.length > 0),
    });
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false, refetchInterval: false },
    },
  });

  // Pinned to the viewport so the captured element is exactly the menubar
  // window, independent of how much content the route happens to render.
  //
  // `data-portal-root` makes this the container Primer mounts its portals in
  // (help popovers, overlays). Without it they land on `document.body`, outside
  // the element screenshotted below.
  const container = document.createElement('div');
  container.dataset.testid = 'visual-root';
  container.dataset.portalRoot = '';
  container.style.cssText = 'position:fixed;inset:0;overflow:hidden';
  document.body.appendChild(container);

  return render(ui, {
    container,
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BaseStyles>
            <Appearance />
            {/* Routes reading `location.state` (AccountScopes) get their
              account through here, so it needs stubbing too. */}
            <MemoryRouter initialEntries={withStubbedAvatars(initialEntries)}>
              <AppLayout>{children}</AppLayout>
            </MemoryRouter>
          </BaseStyles>
        </ThemeProvider>
      </QueryClientProvider>
    ),
  });
}

/**
 * Scrolls the element with the given test id into the centre of its scroll
 * container and waits until it is fully inside the viewport.
 *
 * Settings sections are taller than the menubar window, so states near the
 * bottom need this before they can be captured. `scrollIntoView` uses the
 * nearest scrollable ancestor, which is the route's `Contents` container.
 */
export async function scrollToTestId(testId: string): Promise<void> {
  const element = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
  if (!element) {
    throw new Error(`Cannot scroll to missing test id "${testId}"`);
  }

  element.scrollIntoView({ behavior: 'auto', block: 'center' });

  await waitFor(() => {
    const { top, bottom } = element.getBoundingClientRect();
    if (top < 0 || bottom > window.innerHeight) {
      throw new Error(`"${testId}" is not fully inside the viewport`);
    }
  });
}
