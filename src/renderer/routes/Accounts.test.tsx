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

import { Errors } from '../utils/core/errors';
import * as logger from '../utils/core/logger';
import * as comms from '../utils/system/comms';
import * as links from '../utils/system/links';
import { AccountsRoute } from './Accounts';

describe('renderer/routes/Accounts.tsx', () => {
  describe('General', () => {
    it('should render itself & its children', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockPersonalAccessTokenAccount, mockOAuthAccount, mockGitHubAppAccount],
        });
      });

      expect(screen.getByTestId('accounts')).toBeInTheDocument();
      expect(screen.getAllByTestId('account-profile')).toHaveLength(3);
    });

    it('should go back by pressing the icon', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />);
      });

      await userEvent.click(screen.getByTestId('header-nav-back'));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith(-1);
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

    it('should render with PAT scopes warning', async () => {
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
      await userEvent.click(screen.getAllByTestId('account-view-scopes')[0]);

      expect(navigateMock).toHaveBeenCalledWith('/account-scopes', {
        state: {
          account: {
            ...mockPersonalAccessTokenAccount,
            scopes: ['read:user', 'notifications'],
          },
        },
      });
    });

    it('should set account as primary account', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockPersonalAccessTokenAccount, mockOAuthAccount, mockGitHubAppAccount],
        });
      });

      expect(screen.getByTestId('accounts')).toBeInTheDocument();
      // All 3 accounts render the primary/set-primary button
      expect(screen.getAllByTestId('account-set-primary')).toHaveLength(3);

      await userEvent.click(screen.getAllByTestId('account-set-primary')[1]);

      expect(useAccountsStore.getState().accounts[0]).toBe(mockOAuthAccount);
      expect(navigateMock).toHaveBeenCalledWith('/accounts', { replace: true });
    });

    it('should refresh account', async () => {
      const refreshAccountSpy = vi
        .spyOn(useAccountsStore.getState(), 'refreshAccount')
        .mockResolvedValue(mockPersonalAccessTokenAccount);

      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockPersonalAccessTokenAccount],
        });
      });

      await userEvent.click(screen.getByTestId('account-refresh'));

      expect(refreshAccountSpy).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/accounts', {
        replace: true,
      });
    });

    it('should logout', async () => {
      const logoutFromAccountMock = vi.fn();

      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockPersonalAccessTokenAccount],
          logoutFromAccount: logoutFromAccountMock,
        });
      });

      await userEvent.click(screen.getByTestId('account-logout'));

      expect(logoutFromAccountMock).toHaveBeenCalledTimes(1);
    });

    it('should show view-scopes button for all auth methods', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockPersonalAccessTokenAccount, mockOAuthAccount, mockGitHubAppAccount],
        });
      });

      expect(screen.getAllByTestId('account-view-scopes')).toHaveLength(3);
    });

    it('should navigate to account-scopes when clicking view-scopes', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockPersonalAccessTokenAccount],
        });
      });

      await userEvent.click(screen.getByTestId('account-view-scopes'));

      expect(navigateMock).toHaveBeenCalledWith('/account-scopes', {
        state: { account: mockPersonalAccessTokenAccount },
      });
    });
  });

  describe('Add new accounts', () => {
    it('should show github login methods after selecting GitHub forge', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockOAuthAccount],
        });
      });

      await userEvent.click(screen.getByTestId('account-add-new'));

      expect(screen.getByTestId('account-add-forge-github')).toHaveTextContent('GitHub');

      await userEvent.click(screen.getByTestId('account-add-forge-github'));

      expect(screen.getByTestId('account-add-github')).toHaveTextContent('GitHub');

      await userEvent.click(screen.getByTestId('account-add-github'));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/login/github/device-flow', {
        replace: true,
      });
    });

    it('should show login with personal access token after selecting GitHub forge', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockOAuthAccount],
        });
      });

      await userEvent.click(screen.getByTestId('account-add-new'));
      await userEvent.click(screen.getByTestId('account-add-forge-github'));

      expect(screen.getByTestId('account-add-pat')).toHaveTextContent('Personal Access Token');

      await userEvent.click(screen.getByTestId('account-add-pat'));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/login/github/personal-access-token', {
        replace: true,
      });
    });

    it('should show login with oauth app after selecting GitHub forge', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockPersonalAccessTokenAccount],
        });
      });

      await userEvent.click(screen.getByTestId('account-add-new'));
      await userEvent.click(screen.getByTestId('account-add-forge-github'));

      expect(screen.getByTestId('account-add-oauth-app')).toHaveTextContent('OAuth App');

      await userEvent.click(screen.getByTestId('account-add-oauth-app'));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/login/github/oauth-app', {
        replace: true,
      });
    });

    it('should navigate directly to gitea login (single method forge)', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockOAuthAccount],
        });
      });

      await userEvent.click(screen.getByTestId('account-add-new'));

      expect(screen.getByTestId('account-add-forge-gitea')).toHaveTextContent('Gitea');

      await userEvent.click(screen.getByTestId('account-add-forge-gitea'));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/login/gitea/personal-access-token', {
        replace: true,
      });
    });

    it('should navigate directly to bitbucket login (single method forge)', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockOAuthAccount],
        });
      });

      await userEvent.click(screen.getByTestId('account-add-new'));

      expect(screen.getByTestId('account-add-forge-bitbucket')).toHaveTextContent('Bitbucket');

      await userEvent.click(screen.getByTestId('account-add-forge-bitbucket'));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/login/bitbucket/personal-access-token', {
        replace: true,
      });
    });
  });

  describe('Re-authenticate', () => {
    it('should re-authenticate a github personal access token account', async () => {
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

      await userEvent.click(screen.getByTestId('account-reauthenticate'));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/login/github/personal-access-token', {
        replace: true,
        state: { account: mockPersonalAccessTokenAccount },
      });
    });

    it('should re-authenticate a github app account', async () => {
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

      await userEvent.click(screen.getByTestId('account-reauthenticate'));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/login/github/device-flow', {
        replace: true,
        state: { account: mockGitHubAppAccount },
      });
    });

    it('should re-authenticate an oauth app account', async () => {
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

      await userEvent.click(screen.getByTestId('account-reauthenticate'));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/login/github/oauth-app', {
        replace: true,
        state: { account: mockOAuthAccount },
      });
    });

    it('should re-authenticate a gitea personal access token account', async () => {
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

      await userEvent.click(screen.getByTestId('account-reauthenticate'));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/login/gitea/personal-access-token', {
        replace: true,
        state: { account: mockGiteaAccount },
      });
    });

    it('should log and skip re-authenticate when no login method matches', async () => {
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

      await userEvent.click(screen.getByTestId('account-reauthenticate'));

      expect(navigateMock).not.toHaveBeenCalled();
      expect(rendererLogErrorSpy).toHaveBeenCalledWith(
        'handleReAuthenticate',
        expect.stringContaining('no login method registered'),
        expect.any(Error),
      );
    });

    it('should open developer settings when clicking the bad credentials banner', async () => {
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
    it('should surface a refresh failure without navigating away from accounts', async () => {
      const refreshAccountSpy = vi
        .spyOn(useAccountsStore.getState(), 'refreshAccount')
        .mockRejectedValueOnce(new Error('network down'));

      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockPersonalAccessTokenAccount],
        });
      });

      await userEvent.click(screen.getByTestId('account-refresh'));

      expect(refreshAccountSpy).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/accounts', { replace: true });
    });
  });

  describe('Gitea account affordances', () => {
    it('should hide view-scopes for forges without an oauthScopes capability', async () => {
      await act(async () => {
        renderWithProviders(<AccountsRoute />, {
          accounts: [mockGiteaAccount],
        });
      });

      expect(screen.queryByTestId('account-view-scopes')).not.toBeInTheDocument();
    });
  });
});
