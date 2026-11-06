import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { mockGitHubCloudAccount } from './__mocks__/account-mocks';
import { mockSettings } from './__mocks__/state-mocks';

import { useAccountsStore, useSettingsStore } from './stores';

import type { Account } from './types';

import { routes } from './router';

// Route resolution is the subject of these tests, so use the real router
// instead of the global `useNavigate` mock from vitest.setup.ts.
vi.unmock('react-router');

function renderAt(path: string, { accounts = [] }: { accounts?: Account[] } = {}) {
  useAccountsStore.setState({ accounts });
  useSettingsStore.setState(mockSettings);

  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } },
  });

  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return { ...result, router };
}

afterEach(() => {
  cleanup();
});

describe('renderer/App routing', () => {
  it('redirects an unauthenticated protected route to login and preserves the destination', async () => {
    const { router } = renderAt('/settings');

    expect(await screen.findByTestId('login-scroll-container')).toBeInTheDocument();
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
    expect(router.state.location.state).toEqual({
      from: expect.objectContaining({ pathname: '/settings' }),
    });
  });

  it('returns to the requested destination after login', async () => {
    const { router } = renderAt('/settings');
    await screen.findByTestId('login-scroll-container');

    act(() => {
      useAccountsStore.setState({ accounts: [mockGitHubCloudAccount] });
    });

    await waitFor(() => expect(router.state.location.pathname).toBe('/settings'));
    expect(await screen.findByTestId('settings')).toBeInTheDocument();
  });

  it('lands on the default route when login is opened directly', async () => {
    const { router } = renderAt('/login');
    await screen.findByTestId('login-scroll-container');

    act(() => {
      useAccountsStore.setState({ accounts: [mockGitHubCloudAccount] });
    });

    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
    expect(await screen.findByText('No new notifications')).toBeInTheDocument();
  });

  it('resolves an unknown route to the default screen', async () => {
    const { router } = renderAt('/unknown', { accounts: [mockGitHubCloudAccount] });

    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
    expect(await screen.findByText('No new notifications')).toBeInTheDocument();
  });

  it('marks the active sidebar destination with aria-current', async () => {
    renderAt('/filters', { accounts: [mockGitHubCloudAccount] });

    expect(await screen.findByTestId('filters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filters' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Settings' })).not.toHaveAttribute('aria-current');
  });

  it('keeps back navigation working', async () => {
    const { router } = renderAt('/', { accounts: [mockGitHubCloudAccount] });

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/settings'));

    await act(async () => {
      await router.navigate(-1);
    });

    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
    expect(await screen.findByText('No new notifications')).toBeInTheDocument();
  });

  it('settles on the last route for rapid navigation', async () => {
    const { router } = renderAt('/', { accounts: [mockGitHubCloudAccount] });

    const settings = screen.getByRole('button', { name: 'Settings' });
    const home = screen.getByRole('button', { name: 'Gitify' });

    act(() => {
      settings.click();
      home.click();
    });

    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
    expect(screen.queryByTestId('settings')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Settings' })).not.toHaveFocus();
  });
});
