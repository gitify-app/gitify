import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithAppContext } from '../__helpers__/test-utils';
import {
  mockGitHubAppAccount,
  mockOAuthAccount,
  mockPersonalAccessTokenAccount,
} from '../__mocks__/account-mocks';

import { useAccountsStore } from '../stores';
import * as authUtils from '../utils/auth/utils';
import * as comms from '../utils/system/comms';
import * as links from '../utils/system/links';
import { AccountsRoute } from './Accounts';

describe('renderer/routes/Accounts.tsx', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('General', () => {
    it('should render itself & its children', async () => {
      useAccountsStore.setState({ accounts: [mockPersonalAccessTokenAccount, mockOAuthAccount, mockGitHubAppAccount] });
      await act(async () => {
        renderWithAppContext(<AccountsRoute />);
      });

      expect(screen.getByTestId('accounts')).toBeInTheDocument();
      expect(screen.getAllByTestId('account-profile')).toHaveLength(3);
    });

    it('should go back by pressing the icon', async () => {
      await act(async () => {
        renderWithAppContext(<AccountsRoute />);
      });

      await userEvent.click(screen.getByTestId('header-nav-back'));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith(-1);
    });
  });

  describe('Account interactions', () => {
    const openExternalLinkSpy = vi
      .spyOn(comms, 'openExternalLink')
      .mockImplementation(vi.fn());

    it('open profile in external browser', async () => {
      const openAccountProfileSpy = vi
        .spyOn(links, 'openAccountProfile')
        .mockImplementation(vi.fn());

      useAccountsStore.setState({ accounts: [mockPersonalAccessTokenAccount] });
      await act(async () => {
        renderWithAppContext(<AccountsRoute />);
      });

      await userEvent.click(screen.getByTestId('account-profile'));

      expect(openAccountProfileSpy).toHaveBeenCalledTimes(1);
      expect(openAccountProfileSpy).toHaveBeenCalledWith(
        mockPersonalAccessTokenAccount,
      );
    });

    it('open host in external browser', async () => {
      useAccountsStore.setState({ accounts: [mockPersonalAccessTokenAccount] });
      await act(async () => {
        renderWithAppContext(<AccountsRoute />);
      });

      await userEvent.click(screen.getByTestId('account-host'));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith('https://github.com');
    });

    it('open developer settings in external browser', async () => {
      useAccountsStore.setState({ accounts: [mockPersonalAccessTokenAccount] });
      await act(async () => {
        renderWithAppContext(<AccountsRoute />);
      });

      await userEvent.click(screen.getByTestId('account-developer-settings'));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith(
        'https://github.com/settings/tokens',
      );
    });

    it('should render with PAT scopes warning', async () => {
      useAccountsStore.setState({ accounts: [
        {
          ...mockPersonalAccessTokenAccount,
          scopes: ['read:user', 'notifications'],
        },
        mockOAuthAccount,
        mockGitHubAppAccount,
      ] });
      await act(async () => {
        renderWithAppContext(<AccountsRoute />);
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
      useAccountsStore.setState({ accounts: [mockPersonalAccessTokenAccount, mockOAuthAccount, mockGitHubAppAccount] });
      await act(async () => {
        renderWithAppContext(<AccountsRoute />);
      });

      expect(screen.getByTestId('accounts')).toBeInTheDocument();
      // All 3 accounts render the primary/set-primary button
      expect(screen.getAllByTestId('account-set-primary')).toHaveLength(3);

      // Click set-primary for the second account (mockOAuthAccount)
      await userEvent.click(screen.getAllByTestId('account-set-primary')[1]);

      // mockOAuthAccount should now be primary (first in array)
      expect(useAccountsStore.getState().accounts[0]).toEqual(mockOAuthAccount);
    });

    it('should refresh account', async () => {
      const refreshAccountSpy = vi
        .spyOn(authUtils, 'refreshAccount')
        .mockImplementation(vi.fn());

      useAccountsStore.setState({ accounts: [mockPersonalAccessTokenAccount] });
      await act(async () => {
        renderWithAppContext(<AccountsRoute />);
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

      useAccountsStore.setState({ accounts: [mockPersonalAccessTokenAccount], logoutFromAccount: logoutFromAccountMock as any });

      await act(async () => {
        renderWithAppContext(<AccountsRoute />);
      });

      await userEvent.click(screen.getByTestId('account-logout'));

      expect(logoutFromAccountMock).toHaveBeenCalledTimes(1);
    });

    it('should show view-scopes button for all auth methods', async () => {
      useAccountsStore.setState({ accounts: [mockPersonalAccessTokenAccount, mockOAuthAccount, mockGitHubAppAccount] });
      await act(async () => {
        renderWithAppContext(<AccountsRoute />);
      });

      expect(screen.getAllByTestId('account-view-scopes')).toHaveLength(3);
    });

    it('should navigate to account-scopes when clicking view-scopes', async () => {
      useAccountsStore.setState({ accounts: [mockPersonalAccessTokenAccount] });
      await act(async () => {
        renderWithAppContext(<AccountsRoute />);
      });

      await userEvent.click(screen.getByTestId('account-view-scopes'));

      expect(navigateMock).toHaveBeenCalledWith('/account-scopes', {
        state: { account: mockPersonalAccessTokenAccount },
      });
    });
  });

  describe('Add new accounts', () => {
    it('should show login with github app', async () => {
      useAccountsStore.setState({ accounts: [mockOAuthAccount] });
      await act(async () => {
        renderWithAppContext(<AccountsRoute />);
      });

      await userEvent.click(screen.getByTestId('account-add-new'));
      await userEvent.click(screen.getByTestId('account-add-github'));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/login-device-flow', {
        replace: true,
      });
    });

    it('should show login with personal access token', async () => {
      useAccountsStore.setState({ accounts: [mockOAuthAccount] });
      await act(async () => {
        renderWithAppContext(<AccountsRoute />);
      });

      await userEvent.click(screen.getByTestId('account-add-new'));
      await userEvent.click(screen.getByTestId('account-add-pat'));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith(
        '/login-personal-access-token',
        {
          replace: true,
        },
      );
    });

    it('should show login with oauth app', async () => {
      useAccountsStore.setState({ accounts: [mockPersonalAccessTokenAccount] });
      await act(async () => {
        renderWithAppContext(<AccountsRoute />);
      });

      await userEvent.click(screen.getByTestId('account-add-new'));
      await userEvent.click(screen.getByTestId('account-add-oauth-app'));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/login-oauth-app', {
        replace: true,
      });
    });
  });
});
