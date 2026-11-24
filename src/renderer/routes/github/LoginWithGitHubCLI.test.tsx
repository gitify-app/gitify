import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../../__helpers__/test-utils';
import {
  mockGitHubCliAccount,
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../__mocks__/account-mocks';

import type { IGitHubCliAccountsResult } from '../../../shared/events';

import * as logger from '../../utils/core/logger';
import { GitHubLoginWithCLIRoute } from './LoginWithGitHubCLI';

const SINGLE_ACCOUNT: IGitHubCliAccountsResult = {
  accounts: [{ identity: { kind: 'account', login: 'octocat' }, active: true }],
};

const ACTIVE_OCTOCAT = { kind: 'account' as const, login: 'octocat' };

function stubAccounts(result: IGitHubCliAccountsResult): void {
  vi.mocked(window.gitify.githubCliAccounts).mockResolvedValue(result);
}

async function waitForLoginReady(): Promise<HTMLElement> {
  const button = screen.getByRole('button', { name: 'Login' });
  await waitFor(() => expect(button).toBeEnabled());
  return button;
}

describe('renderer/routes/github/LoginWithGitHubCLI.tsx', () => {
  const loginWithCliMock = vi.fn();

  it('renders correctly', async () => {
    const tree = renderWithProviders(<GitHubLoginWithCLIRoute />);

    await waitForLoginReady();

    expect(tree.container).toMatchSnapshot();
  });

  it('logs in against github.com with the offered identity', async () => {
    loginWithCliMock.mockResolvedValueOnce(undefined);

    renderWithProviders(<GitHubLoginWithCLIRoute />, { loginWithCli: loginWithCliMock });

    expect(screen.queryByTestId('login-token')).not.toBeInTheDocument();

    const button = await waitForLoginReady();
    await userEvent.click(button);

    await waitFor(() => {
      expect(loginWithCliMock).toHaveBeenCalledWith('github', 'github.com', ACTIVE_OCTOCAT);
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  it('logs in against the hostname entered', async () => {
    loginWithCliMock.mockResolvedValueOnce(undefined);

    renderWithProviders(<GitHubLoginWithCLIRoute />, { loginWithCli: loginWithCliMock });

    const hostname = screen.getByRole('textbox', { name: /Hostname/ });
    await userEvent.clear(hostname);
    await userEvent.type(hostname, 'github.gitify.io');
    const button = await waitForLoginReady();
    await userEvent.click(button);

    await waitFor(() =>
      expect(loginWithCliMock).toHaveBeenCalledWith('github', 'github.gitify.io', ACTIVE_OCTOCAT),
    );
  });

  it('prefills the hostname of the account being re-authenticated', () => {
    renderWithProviders(<GitHubLoginWithCLIRoute />, {
      initialEntries: [
        {
          pathname: '/login/github/cli',
          state: { account: mockGitHubEnterpriseServerAccount },
        },
      ],
    });

    expect(screen.getByRole('textbox', { name: /Hostname/ })).toHaveValue(
      mockGitHubEnterpriseServerAccount.hostname,
    );
  });

  it('rejects a malformed hostname before reaching the CLI', async () => {
    renderWithProviders(<GitHubLoginWithCLIRoute />, { loginWithCli: loginWithCliMock });

    const hostname = screen.getByRole('textbox', { name: /Hostname/ });
    await userEvent.clear(hostname);
    await userEvent.type(hostname, 'hello');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(screen.getByTestId('login-errors')).toHaveTextContent('Hostname format is invalid');
    expect(loginWithCliMock).not.toHaveBeenCalled();
  });

  it('surfaces what the CLI said when login fails', async () => {
    vi.spyOn(logger, 'rendererLogError').mockImplementation(vi.fn());
    loginWithCliMock.mockRejectedValueOnce(
      new Error('GitHub CLI has no token for github.com. Run `gh auth login` and try again.'),
    );

    renderWithProviders(<GitHubLoginWithCLIRoute />, { loginWithCli: loginWithCliMock });

    const button = await waitForLoginReady();
    await userEvent.click(button);

    await waitFor(() =>
      expect(screen.getByTestId('login-errors')).toHaveTextContent(
        'GitHub CLI has no token for github.com.',
      ),
    );
    expect(navigateMock).not.toHaveBeenCalledWith('/');
  });

  it('lists every stored account and preselects the active one', async () => {
    stubAccounts({
      accounts: [
        { identity: { kind: 'account', login: 'alice' }, active: true },
        { identity: { kind: 'account', login: 'bob' }, active: false },
      ],
    });

    renderWithProviders(<GitHubLoginWithCLIRoute />, { loginWithCli: loginWithCliMock });

    const select = await screen.findByTestId('login-cli-account');
    expect(await waitForLoginReady()).toBeEnabled();
    expect(select).toHaveValue('account:alice');
    expect(within(select).getByRole('option', { name: 'alice (active)' })).toBeInTheDocument();
    expect(within(select).getByRole('option', { name: 'bob' })).toBeInTheDocument();
  });

  it('logs in with the enterprise managed account the user picks', async () => {
    loginWithCliMock.mockResolvedValueOnce(undefined);
    stubAccounts({
      accounts: [
        { identity: { kind: 'account', login: 'alice' }, active: true },
        { identity: { kind: 'account', login: 'mona-cat_octo' }, active: false },
      ],
    });

    renderWithProviders(<GitHubLoginWithCLIRoute />, { loginWithCli: loginWithCliMock });

    const select = await screen.findByTestId('login-cli-account');
    await userEvent.selectOptions(select, 'account:mona-cat_octo');
    await userEvent.click(await waitForLoginReady());

    await waitFor(() =>
      expect(loginWithCliMock).toHaveBeenCalledWith('github', 'github.com', {
        kind: 'account',
        login: 'mona-cat_octo',
      }),
    );
  });

  it('disables already enrolled accounts and preselects the only available account', async () => {
    stubAccounts({
      accounts: [
        { identity: { kind: 'account', login: 'alice' }, active: true },
        { identity: { kind: 'account', login: 'bob' }, active: false },
      ],
    });
    renderWithProviders(<GitHubLoginWithCLIRoute />, {
      accounts: [
        { ...mockGitHubCloudAccount, user: { ...mockGitHubCloudAccount.user!, login: 'Alice' } },
      ],
    });

    const select = await screen.findByTestId('login-cli-account');
    expect(
      within(select).getByRole('option', { name: 'alice (already in Gitify)' }),
    ).toBeDisabled();
    expect(select).toHaveValue('account:bob');
    expect(await waitForLoginReady()).toBeEnabled();
  });

  it('blocks login when the only CLI account is already enrolled', async () => {
    renderWithProviders(<GitHubLoginWithCLIRoute />, {
      accounts: [{ ...mockGitHubCliAccount, cliIdentity: ACTIVE_OCTOCAT }],
    });

    const select = await screen.findByTestId('login-cli-account');
    expect(
      within(select).getByRole('option', { name: 'octocat (already in Gitify)' }),
    ).toBeDisabled();
    expect(select).toHaveValue('');
    expect(
      within(select).getByRole('option', { name: 'All accounts already in Gitify' }),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Login' })).toBeDisabled();
  });

  it('offers the environment credential as its own choice', async () => {
    loginWithCliMock.mockResolvedValueOnce(undefined);
    stubAccounts({
      accounts: [
        { identity: { kind: 'account', login: 'alice' }, active: false },
        { identity: { kind: 'environment' }, active: true },
      ],
    });

    renderWithProviders(<GitHubLoginWithCLIRoute />, { loginWithCli: loginWithCliMock });

    const select = await screen.findByTestId('login-cli-account');
    expect(within(select).getByRole('option', { name: 'Environment token' })).toBeInTheDocument();
    await userEvent.selectOptions(select, 'environment');
    await userEvent.click(await waitForLoginReady());

    await waitFor(() =>
      expect(loginWithCliMock).toHaveBeenCalledWith('github', 'github.com', {
        kind: 'environment',
      }),
    );
  });

  it('hides the choice when only one account is offered', async () => {
    renderWithProviders(<GitHubLoginWithCLIRoute />, { loginWithCli: loginWithCliMock });

    await waitForLoginReady();

    expect(screen.queryByTestId('login-cli-account')).not.toBeInTheDocument();
  });

  it('explains how to add an account when the CLI has none', async () => {
    stubAccounts({ accounts: [] });
    renderWithProviders(<GitHubLoginWithCLIRoute />, { loginWithCli: loginWithCliMock });

    await waitFor(() => expect(screen.getByTestId('login-cli-no-accounts')).toBeVisible());

    expect(screen.getByTestId('login-cli-no-accounts')).toHaveTextContent('gh auth login');
    expect(screen.getByRole('button', { name: 'Login' })).toBeDisabled();
  });

  it('disables login when the CLI account list cannot be read', async () => {
    stubAccounts({ error: 'GH_FAILED', detail: 'keyring is locked' });
    renderWithProviders(<GitHubLoginWithCLIRoute />, { loginWithCli: loginWithCliMock });

    await waitFor(() =>
      expect(screen.getByText(/Could not load GitHub CLI accounts/)).toBeVisible(),
    );
    expect(screen.getByRole('button', { name: 'Login' })).toBeDisabled();
  });

  it('falls back to the active account on a CLI that cannot list accounts', async () => {
    loginWithCliMock.mockResolvedValueOnce(undefined);
    stubAccounts({ error: 'GH_ACCOUNTS_UNSUPPORTED' });
    renderWithProviders(<GitHubLoginWithCLIRoute />, { loginWithCli: loginWithCliMock });

    const button = await waitForLoginReady();
    expect(screen.queryByTestId('login-cli-account')).not.toBeInTheDocument();
    expect(screen.getByText(/Using the active account/)).toBeVisible();

    await userEvent.click(button);

    await waitFor(() =>
      expect(loginWithCliMock).toHaveBeenCalledWith('github', 'github.com', undefined),
    );
  });

  it('preselects the pinned identity when re-authenticating', async () => {
    const account = {
      ...mockGitHubCliAccount,
      cliIdentity: { kind: 'account' as const, login: 'bob' },
    };
    stubAccounts({
      accounts: [
        { identity: { kind: 'account', login: 'alice' }, active: true },
        { identity: { kind: 'account', login: 'bob' }, active: false },
      ],
    });

    renderWithProviders(<GitHubLoginWithCLIRoute />, {
      accounts: [account],
      initialEntries: [
        {
          pathname: '/login/github/cli',
          state: {
            account,
          },
        },
      ],
    });

    const select = await screen.findByTestId('login-cli-account');
    expect(select).toHaveValue('account:bob');
    expect(within(select).getByRole('option', { name: 'bob' })).toBeEnabled();
  });

  it('requires a new choice when the pinned identity is gone', async () => {
    stubAccounts({
      accounts: [
        { identity: { kind: 'account', login: 'alice' }, active: true },
        { identity: { kind: 'account', login: 'bob' }, active: false },
      ],
    });

    renderWithProviders(<GitHubLoginWithCLIRoute />, {
      initialEntries: [
        {
          pathname: '/login/github/cli',
          state: {
            account: {
              ...mockGitHubEnterpriseServerAccount,
              cliIdentity: { kind: 'account', login: 'carol' },
            },
          },
        },
      ],
    });

    expect(await screen.findByTestId('login-cli-account')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Login' })).toBeDisabled();
  });

  it('reloads the account list when the hostname changes', async () => {
    stubAccounts(SINGLE_ACCOUNT);
    vi.mocked(window.gitify.githubCliAccounts)
      .mockResolvedValueOnce(SINGLE_ACCOUNT)
      .mockResolvedValueOnce({
        accounts: [{ identity: { kind: 'account', login: 'enterprise' }, active: true }],
      });

    renderWithProviders(<GitHubLoginWithCLIRoute />, { loginWithCli: loginWithCliMock });
    await waitForLoginReady();

    const hostname = screen.getByRole('textbox', { name: /Hostname/ });
    await userEvent.clear(hostname);
    await userEvent.type(hostname, 'github.gitify.io');
    const button = await waitForLoginReady();

    await waitFor(() =>
      expect(window.gitify.githubCliAccounts).toHaveBeenLastCalledWith('github.gitify.io'),
    );
    expect(screen.queryByTestId('login-cli-account')).not.toBeInTheDocument();
    await userEvent.click(button);

    await waitFor(() =>
      expect(loginWithCliMock).toHaveBeenCalledWith('github', 'github.gitify.io', {
        kind: 'account',
        login: 'enterprise',
      }),
    );
  });
});
