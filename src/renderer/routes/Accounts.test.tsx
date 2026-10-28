import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../__helpers__/test-utils';
import {
  mockGiteaAccount,
  mockGitHubAppAccount,
  mockOAuthAccount,
  mockPersonalAccessTokenAccount,
} from '../__mocks__/account-mocks';

import { useAccountsStore } from '../stores';

import {
  getAlternateScopeNames,
  getRecommendedScopeNames,
  getRequiredScopeNames,
} from '../utils/auth/scopes';
import { getAccountUUID } from '../utils/auth/utils';
import { Errors } from '../utils/core/errors';
import * as logger from '../utils/core/logger';
import * as comms from '../utils/system/comms';
import * as links from '../utils/system/links';
import { AccountsRoute } from './Accounts';

describe('renderer/routes/Accounts.tsx', () => {
  describe('General', () => {
    it('renders itself & its children', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockPersonalAccessTokenAccount, mockOAuthAccount, mockGitHubAppAccount],
        });
      });

      expect(screen.getByTestId('accounts')).toBeInTheDocument();
      expect(screen.getAllByTestId('account-profile')).toHaveLength(3);
    });

    it('goes back by pressing the icon', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />);
      });

      await userEvent.click(screen.getByRole('button', { name: 'Go back' }));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith(-1);
    });

    it('renders the managed GitHub account login and profile name separately', async () => {
      const account = {
        ...mockPersonalAccessTokenAccount,
        user: {
          ...mockPersonalAccessTokenAccount.user!,
          login: 'octocat_gitify',
          name: 'Mona Lisa Octocat',
        },
      };

      await act(async () => {
        renderWithProviders(<AccountsRoute />, { accounts: [account] });
      });

      expect(screen.getByText('octocat_gitify')).toBeInTheDocument();
      expect(screen.getByAltText('octocat_gitify')).toBeInTheDocument();
      expect(screen.getByText('Mona Lisa Octocat')).toBeInTheDocument();
    });
  });

  describe('Scopes icon', () => {
    const scopeCases = [
      {
        name: 'recommended scopes',
        scopes: getRecommendedScopeNames(),
        variant: 'default',
      },
      {
        name: 'alternate scopes only',
        scopes: getAlternateScopeNames(),
        variant: 'default',
      },
      {
        name: 'neither scope set',
        scopes: getRequiredScopeNames(),
        variant: 'danger',
      },
      {
        name: 'both scope sets',
        scopes: [...new Set([...getRecommendedScopeNames(), ...getAlternateScopeNames()])],
        variant: 'default',
      },
    ];

    it.each(scopeCases)(
      'preserves the icon color and button variant for $name',
      async ({ scopes, variant }) => {
        const account = { ...mockPersonalAccessTokenAccount, scopes };

        await act(async () => {
          renderWithProviders(<AccountsRoute />, { accounts: [account] });
        });

        const button = screen.getByRole('button', {
          name: `View scopes for ${account.user?.login}`,
        });

        expect(button.querySelector('svg')).toHaveClass('octicon-shield-check');
        expect(button).toHaveAttribute('data-variant', variant);
        expect(button).toHaveAttribute('data-size', 'small');
      },
    );

    it.each(scopeCases)(
      'retains the icon across an unrelated account update for $name',
      async ({ scopes }) => {
        const account = { ...mockPersonalAccessTokenAccount, scopes };

        await act(async () => {
          renderWithProviders(<AccountsRoute />, { accounts: [account] });
        });

        const icon = screen
          .getByRole('button', { name: `View scopes for ${account.user?.login}` })
          .querySelector('svg');
        expect(icon).toBeInTheDocument();

        const updatedAccount = {
          ...account,
          user: { ...account.user!, name: 'Updated account name' },
        };
        expect(getAccountUUID(updatedAccount)).toBe(getAccountUUID(account));

        await act(async () => {
          useAccountsStore.setState({ accounts: [updatedAccount] });
        });

        expect(screen.getByText('Updated account name')).toBeInTheDocument();
        expect(
          screen
            .getByRole('button', { name: `View scopes for ${account.user?.login}` })
            .querySelector('svg'),
        ).toBe(icon);
      },
    );

    it('updates the icon, variant, and navigation account when scopes change', async () => {
      const account = {
        ...mockPersonalAccessTokenAccount,
        scopes: getRequiredScopeNames(),
      };

      await act(async () => {
        renderWithProviders(<AccountsRoute />, { accounts: [account] });
      });

      const button = screen.getByRole('button', {
        name: `View scopes for ${account.user?.login}`,
      });

      expect(button).toHaveAttribute('data-variant', 'danger');

      const updatedAccount = { ...account, scopes: getRecommendedScopeNames() };
      expect(getAccountUUID(updatedAccount)).toBe(getAccountUUID(account));

      await act(async () => {
        useAccountsStore.setState({ accounts: [updatedAccount] });
      });

      const updatedButton = screen.getByRole('button', {
        name: `View scopes for ${updatedAccount.user?.login}`,
      });

      expect(updatedButton).toHaveAttribute('data-variant', 'default');

      await userEvent.click(updatedButton);

      expect(navigateMock).toHaveBeenCalledWith('/account-scopes', {
        state: { account: updatedAccount },
      });
    });
  });

  describe('Account interactions', () => {
    const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());

    it('open profile in external browser', async () => {
      const openAccountProfileSpy = vi
        .spyOn(links, 'openAccountProfile')
        .mockImplementation(vi.fn());

      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockPersonalAccessTokenAccount],
        });
      });

      await userEvent.click(screen.getByTestId('account-profile'));

      expect(openAccountProfileSpy).toHaveBeenCalledTimes(1);
      expect(openAccountProfileSpy).toHaveBeenCalledWith(mockPersonalAccessTokenAccount);
    });

    it('open host in external browser', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockPersonalAccessTokenAccount],
        });
      });

      await userEvent.click(screen.getByTestId('account-host'));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith('https://github.com');
    });

    it('open developer settings in external browser', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockPersonalAccessTokenAccount],
        });
      });

      await userEvent.click(screen.getByTestId('account-developer-settings'));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith('https://github.com/settings/tokens');
    });

    it('renders with PAT scopes warning', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [
            {
              ...mockPersonalAccessTokenAccount,
              scopes: ['read:user', 'notifications'],
            },
            mockOAuthAccount,
            mockGitHubAppAccount,
          ],
        });
      });

      expect(screen.getByTestId('accounts')).toBeInTheDocument();

      // Clicking the scopes button for the account with missing scopes
      // navigates to the scopes route where the user can investigate.
      await userEvent.click(screen.getAllByRole('button', { name: /^View scopes for / })[0]);

      expect(navigateMock).toHaveBeenCalledWith('/account-scopes', {
        state: {
          account: {
            ...mockPersonalAccessTokenAccount,
            scopes: ['read:user', 'notifications'],
          },
        },
      });
    });

    it('sets account as primary account', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockPersonalAccessTokenAccount, mockOAuthAccount, mockGitHubAppAccount],
        });
      });

      expect(screen.getByTestId('accounts')).toBeInTheDocument();
      // All 3 accounts render the primary/set-primary button
      expect(screen.getAllByRole('button', { name: /^Set as primary account/ })).toHaveLength(3);

      await userEvent.click(screen.getAllByRole('button', { name: /^Set as primary account/ })[1]);

      expect(useAccountsStore.getState().accounts[0]).toBe(mockOAuthAccount);
      expect(navigateMock).toHaveBeenCalledWith('/accounts', { replace: true });
    });

    it('refreshes account', async () => {
      const refreshAccountSpy = vi
        .spyOn(useAccountsStore.getState(), 'refreshAccount')
        .mockResolvedValue(mockPersonalAccessTokenAccount);

      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockPersonalAccessTokenAccount],
        });
      });

      await userEvent.click(screen.getByRole('button', { name: /^Refresh / }));

      expect(refreshAccountSpy).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/accounts', {
        replace: true,
      });
    });

    it('logs out', async () => {
      const logoutFromAccountMock = vi.fn();

      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockPersonalAccessTokenAccount],
          logoutFromAccount: logoutFromAccountMock,
        });
      });

      await userEvent.click(screen.getByRole('button', { name: /^Logout / }));

      expect(logoutFromAccountMock).toHaveBeenCalledTimes(1);
    });

    it('shows view-scopes button for all auth methods', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockPersonalAccessTokenAccount, mockOAuthAccount, mockGitHubAppAccount],
        });
      });

      expect(screen.getAllByRole('button', { name: /^View scopes for / })).toHaveLength(3);
    });

    it('navigates to account-scopes when clicking view-scopes', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockPersonalAccessTokenAccount],
        });
      });

      await userEvent.click(screen.getByRole('button', { name: /^View scopes for / }));

      expect(navigateMock).toHaveBeenCalledWith('/account-scopes', {
        state: { account: mockPersonalAccessTokenAccount },
      });
    });
  });

  describe('Add new accounts', () => {
    it('shows github login methods after selecting GitHub forge', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockOAuthAccount],
        });
      });

      await userEvent.click(screen.getByRole('button', { name: 'Add new account' }));

      expect(screen.getByRole('menuitem', { name: /^GitHub/ })).toHaveTextContent('GitHub');

      await userEvent.click(screen.getByRole('menuitem', { name: /^GitHub/ }));

      expect(screen.getByRole('menuitem', { name: /^GitHub$/ })).toHaveTextContent('GitHub');

      await userEvent.click(screen.getByRole('menuitem', { name: /^GitHub$/ }));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/login/github/device-flow', {
        replace: true,
      });
    });

    it('shows login with personal access token after selecting GitHub forge', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockOAuthAccount],
        });
      });

      await userEvent.click(screen.getByRole('button', { name: 'Add new account' }));
      await userEvent.click(screen.getByRole('menuitem', { name: /^GitHub/ }));

      expect(screen.getByRole('menuitem', { name: /^Personal Access Token/ })).toHaveTextContent(
        'Personal Access Token',
      );

      await userEvent.click(screen.getByRole('menuitem', { name: /^Personal Access Token/ }));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/login/github/personal-access-token', {
        replace: true,
      });
    });

    it('shows login with oauth app after selecting GitHub forge', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockPersonalAccessTokenAccount],
        });
      });

      await userEvent.click(screen.getByRole('button', { name: 'Add new account' }));
      await userEvent.click(screen.getByRole('menuitem', { name: /^GitHub/ }));

      expect(screen.getByRole('menuitem', { name: /^OAuth App/ })).toHaveTextContent('OAuth App');

      await userEvent.click(screen.getByRole('menuitem', { name: /^OAuth App/ }));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/login/github/oauth-app', {
        replace: true,
      });
    });

    it('navigates directly to gitea login (single method forge)', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockOAuthAccount],
        });
      });

      await userEvent.click(screen.getByRole('button', { name: 'Add new account' }));

      expect(screen.getByRole('menuitem', { name: /^Gitea/ })).toHaveTextContent('Gitea');

      await userEvent.click(screen.getByRole('menuitem', { name: /^Gitea/ }));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/login/gitea/personal-access-token', {
        replace: true,
      });
    });

    it('navigates directly to bitbucket login (single method forge)', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockOAuthAccount],
        });
      });

      await userEvent.click(screen.getByRole('button', { name: 'Add new account' }));

      expect(screen.getByRole('menuitem', { name: /^Bitbucket/ })).toHaveTextContent('Bitbucket');

      await userEvent.click(screen.getByRole('menuitem', { name: /^Bitbucket/ }));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/login/bitbucket/personal-access-token', {
        replace: true,
      });
    });
  });

  describe('Re-authenticate', () => {
    it('re-authenticates a github personal access token account', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockPersonalAccessTokenAccount],
          notifications: [
            {
              account: mockPersonalAccessTokenAccount,
              notifications: [],
              error: Errors.BAD_CREDENTIALS,
            },
          ],
        });
      });

      expect(screen.queryByRole('button', { name: /^View scopes for / })).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: /^Re-authenticate / }));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/login/github/personal-access-token', {
        replace: true,
        state: { account: mockPersonalAccessTokenAccount },
      });
    });

    it('re-authenticates a github app account', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockGitHubAppAccount],
          notifications: [
            {
              account: mockGitHubAppAccount,
              notifications: [],
              error: Errors.BAD_CREDENTIALS,
            },
          ],
        });
      });

      await userEvent.click(screen.getByRole('button', { name: /^Re-authenticate / }));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/login/github/device-flow', {
        replace: true,
        state: { account: mockGitHubAppAccount },
      });
    });

    it('re-authenticates an oauth app account', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockOAuthAccount],
          notifications: [
            {
              account: mockOAuthAccount,
              notifications: [],
              error: Errors.BAD_CREDENTIALS,
            },
          ],
        });
      });

      await userEvent.click(screen.getByRole('button', { name: /^Re-authenticate / }));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/login/github/oauth-app', {
        replace: true,
        state: { account: mockOAuthAccount },
      });
    });

    it('re-authenticates a gitea personal access token account', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockGiteaAccount],
          notifications: [
            {
              account: mockGiteaAccount,
              notifications: [],
              error: Errors.BAD_CREDENTIALS,
            },
          ],
        });
      });

      await userEvent.click(screen.getByRole('button', { name: /^Re-authenticate / }));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/login/gitea/personal-access-token', {
        replace: true,
        state: { account: mockGiteaAccount },
      });
    });

    it('logs and skip re-authenticate when no login method matches', async () => {
      const rendererLogErrorSpy = vi.spyOn(logger, 'rendererLogError').mockImplementation(vi.fn());
      // Gitea only registers PAT — a GitHub App method has no matching loginMethod.
      const unsupportedAccount = {
        ...mockGiteaAccount,
        method: 'GitHub App' as const,
      };

      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [unsupportedAccount],
          notifications: [
            {
              account: unsupportedAccount,
              notifications: [],
              error: Errors.BAD_CREDENTIALS,
            },
          ],
        });
      });

      await userEvent.click(screen.getByRole('button', { name: /^Re-authenticate / }));

      expect(navigateMock).not.toHaveBeenCalled();
      expect(rendererLogErrorSpy).toHaveBeenCalledWith(
        'handleReAuthenticate',
        expect.stringContaining('no login method registered'),
        expect.any(Error),
      );
    });

    it('opens developer settings when clicking the bad credentials banner', async () => {
      const openAccountSettingsSpy = vi
        .spyOn(links, 'openAccountSettings')
        .mockImplementation(vi.fn());

      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockPersonalAccessTokenAccount],
          notifications: [
            {
              account: mockPersonalAccessTokenAccount,
              notifications: [],
              error: Errors.BAD_CREDENTIALS,
            },
          ],
        });
      });

      await userEvent.click(screen.getByTestId('account-bad-credentials'));

      expect(openAccountSettingsSpy).toHaveBeenCalledTimes(1);
      expect(openAccountSettingsSpy).toHaveBeenCalledWith(mockPersonalAccessTokenAccount);
    });
  });

  describe('Refresh errors', () => {
    it('surfaces a refresh failure without navigating away from accounts', async () => {
      const refreshAccountSpy = vi
        .spyOn(useAccountsStore.getState(), 'refreshAccount')
        .mockRejectedValueOnce(new Error('network down'));

      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockPersonalAccessTokenAccount],
        });
      });

      await userEvent.click(screen.getByRole('button', { name: /^Refresh / }));

      expect(refreshAccountSpy).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/accounts', { replace: true });
    });
  });

  describe('Gitea account affordances', () => {
    it('hides view-scopes for forges without an oauthScopes capability', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockGiteaAccount],
        });
      });

      expect(screen.queryByRole('button', { name: /^View scopes for / })).not.toBeInTheDocument();
    });
  });
});
