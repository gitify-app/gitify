import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockGitHubCloudAccount, mockPersonalAccessTokenAccount } from './__mocks__/account-mocks';
import { mockSettings } from './__mocks__/state-mocks';

import { useAccountsStore, useSettingsStore } from './stores';

import { App } from './App';

// Route resolution is the subject of these tests, so use the real router
// instead of the global `useNavigate` mock from vitest.setup.ts.
vi.unmock('react-router');

const PROTECTED_PATHS = ['/', '/settings', '/filters', '/accounts', '/account-scopes'];

function setHash(path: string) {
  window.history.replaceState(null, '', `#${path}`);
}

async function renderApp(path: string) {
  useAccountsStore.setState({
    accounts: PROTECTED_PATHS.includes(path) ? [mockGitHubCloudAccount] : [],
  });
  useSettingsStore.setState(mockSettings);
  setHash(path);

  await act(async () => {
    render(<App />);
  });
}

afterEach(() => {
  cleanup();
  setHash('/');
});

describe('renderer/App.tsx routing', () => {
  it('redirects an unauthenticated protected route to login and preserves the destination', async () => {
    setHash('/settings');
    render(<App />);

    expect(await screen.findByTestId('login-scroll-container')).toBeInTheDocument();
    expect(window.location.hash).toBe('#/login');
    expect(window.history.state?.usr).toEqual({
      from: expect.objectContaining({ pathname: '/settings' }),
    });
  });

  it('resolves the notifications route at the hash root', async () => {
    await renderApp('/');

    expect(await screen.findByText('No new notifications')).toBeInTheDocument();
    expect(window.location.hash).toBe('#/');
  });

  it.each([
    ['/settings', 'settings'],
    ['/filters', 'filters'],
    ['/accounts', 'accounts'],
    ['/login', 'login-scroll-container'],
    ['/login/github/device-flow', 'Login With Device Flow'],
    ['/login/github/cli', 'Login With GitHub CLI'],
    ['/login/github/personal-access-token', 'Login With Personal Access Token'],
    ['/login/github/custom-oauth-app', 'Login With Custom OAuth App'],
    ['/login/gitea/personal-access-token', 'Login With Personal Access Token'],
    ['/login/bitbucket/personal-access-token', 'Login With Personal Access Token'],
    ['/login/gitlab/personal-access-token', 'Login With Personal Access Token'],
  ])('resolves %s', async (path, testId) => {
    await renderApp(path);

    expect(await screen.findByTestId(testId)).toBeInTheDocument();
    expect(window.location.hash).toBe(`#${path}`);
  });

  it('preserves the account-scopes destination using router state', async () => {
    useAccountsStore.setState({ accounts: [mockPersonalAccessTokenAccount] });
    window.history.replaceState(
      { usr: { account: mockPersonalAccessTokenAccount }, key: 'account-scopes', idx: 0 },
      '',
      '#/account-scopes',
    );
    render(<App />);

    expect(await screen.findByTestId('account-scopes')).toBeInTheDocument();
  });

  it('keeps browser back and forward navigation working', async () => {
    await renderApp('/');

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(await screen.findByTestId('settings')).toBeInTheDocument();

    await act(async () => {
      window.history.back();
    });
    await waitFor(() => expect(window.location.hash).toBe('#/'));
    expect(await screen.findByText('No new notifications')).toBeInTheDocument();

    await act(async () => {
      window.history.forward();
    });
    await waitFor(() => expect(window.location.hash).toBe('#/settings'));
    expect(await screen.findByTestId('settings')).toBeInTheDocument();
  });

  it('navigates between settings and the notification list through app controls', async () => {
    await renderApp('/');

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(await screen.findByTestId('settings')).toBeInTheDocument();
    expect(window.location.hash).toBe('#/settings');

    await userEvent.click(screen.getByRole('button', { name: 'Go back' }));
    await waitFor(() => expect(window.location.hash).toBe('#/'));
    expect(await screen.findByText('No new notifications')).toBeInTheDocument();
  });

  it('settles on the last route for rapid navigation without stale content or trapped focus', async () => {
    await renderApp('/');

    const [settings, home] = [
      screen.getByRole('button', { name: 'Settings' }),
      screen.getByRole('button', { name: 'Gitify' }),
    ];

    act(() => {
      fireEvent.click(settings);
      fireEvent.click(home);
    });

    await waitFor(() => expect(window.location.hash).toBe('#/'));
    expect(await screen.findByText('No new notifications')).toBeInTheDocument();
    expect(screen.queryByTestId('settings')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Settings' })).not.toHaveFocus();

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(await screen.findByTestId('settings')).toBeInTheDocument();
  });

  it('keeps an unknown route on the same empty layout fallback', async () => {
    await renderApp('/unknown');

    expect(await screen.findByLabelText('initial focus')).toBeInTheDocument();
    expect(screen.queryByTestId('notifications')).not.toBeInTheDocument();
    expect(window.location.hash).toBe('#/unknown');
  });
});
