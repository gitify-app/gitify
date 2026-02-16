import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../__helpers__/test-utils';
import {
  mockGitHubAppAccount,
  mockOAuthAccount,
  mockPersonalAccessTokenAccount,
} from '../__mocks__/account-mocks';

import * as authUtils from '../utils/auth/utils';
import * as comms from '../utils/comms';
import * as links from '../utils/links';
import * as storage from '../utils/storage';
import { AccountsRoute } from './Accounts';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => navigateMock,
}));

describe('renderer/routes/Accounts.tsx', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('General', () => {
    it('should render itself & its children', async () => {
      await act(async () => {
        renderWithAppContext(<AccountsRoute />, {
          auth: {
            accounts: [
              mockPersonalAccessTokenAccount,
              mockOAuthAccount,
              mockGitHubAppAccount,
            ],
          },
        });
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

      await act(async () => {
        renderWithAppContext(<AccountsRoute />, {
          auth: { accounts: [mockPersonalAccessTokenAccount] },
        });
      });

      await userEvent.click(screen.getByTestId('account-profile'));

      expect(openAccountProfileSpy).toHaveBeenCalledTimes(1);
      expect(openAccountProfileSpy).toHaveBeenCalledWith(
        mockPersonalAccessTokenAccount,
      );
    });

    it('open host in external browser', async () => {
      await act(async () => {
        renderWithAppContext(<AccountsRoute />, {
          auth: { accounts: [mockPersonalAccessTokenAccount] },
        });
      });

      await userEvent.click(screen.getByTestId('account-host'));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith('https://github.com');
    });

    it('open developer settings in external browser', async () => {
      await act(async () => {
        renderWithAppContext(<AccountsRoute />, {
          auth: { accounts: [mockPersonalAccessTokenAccount] },
        });
      });

      await userEvent.click(screen.getByTestId('account-developer-settings'));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith(
        'https://github.com/settings/tokens',
      );
    });

    it('should render with PAT scopes warning', async () => {
      await act(async () => {
        renderWithAppContext(<AccountsRoute />, {
          auth: {
            accounts: [
              { ...mockPersonalAccessTokenAccount, hasRequiredScopes: false },
              mockOAuthAccount,
              mockGitHubAppAccount,
            ],
          },
        });
      });

      expect(screen.getByTestId('accounts')).toBeInTheDocument();
      // All 3 accounts render the warning button, but only 1 is visible
      expect(screen.getAllByTestId('account-missing-scopes')).toHaveLength(3);

      await userEvent.click(screen.getAllByTestId('account-missing-scopes')[0]);

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith(
        'https://github.com/settings/tokens',
      );
    });

    it('should set account as primary account', async () => {
      const saveStateSpy = vi
        .spyOn(storage, 'saveState')
        .mockImplementation(vi.fn());

      await act(async () => {
        renderWithAppContext(<AccountsRoute />, {
          auth: {
            accounts: [
              mockPersonalAccessTokenAccount,
              mockOAuthAccount,
              mockGitHubAppAccount,
            ],
          },
        });
      });

      expect(screen.getByTestId('accounts')).toBeInTheDocument();
      // All 3 accounts render the primary/set-primary button
      expect(screen.getAllByTestId('account-set-primary')).toHaveLength(3);

      await userEvent.click(screen.getAllByTestId('account-set-primary')[0]);

      expect(saveStateSpy).toHaveBeenCalled();
    });

    it('should refresh account', async () => {
      const refreshAccountSpy = vi
        .spyOn(authUtils, 'refreshAccount')
        .mockImplementation(vi.fn());

      await act(async () => {
        renderWithAppContext(<AccountsRoute />, {
          auth: { accounts: [mockPersonalAccessTokenAccount] },
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
        renderWithAppContext(<AccountsRoute />, {
          auth: { accounts: [mockPersonalAccessTokenAccount] },
          logoutFromAccount: logoutFromAccountMock,
        });
      });

      await userEvent.click(screen.getByTestId('account-logout'));

      expect(logoutFromAccountMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith(-1);
    });
  });

  describe('Add new accounts', () => {
    it('should show login with github app', async () => {
      await act(async () => {
        renderWithAppContext(<AccountsRoute />, {
          auth: { accounts: [mockOAuthAccount] },
        });
      });

      await userEvent.click(screen.getByTestId('account-add-new'));
      await userEvent.click(screen.getByTestId('account-add-github'));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/login-device-flow', {
        replace: true,
      });
    });

    it('should show login with personal access token', async () => {
      await act(async () => {
        renderWithAppContext(<AccountsRoute />, {
          auth: { accounts: [mockOAuthAccount] },
        });
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
      await act(async () => {
        renderWithAppContext(<AccountsRoute />, {
          auth: { accounts: [mockPersonalAccessTokenAccount] },
        });
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
