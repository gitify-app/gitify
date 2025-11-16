import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../__helpers__/test-utils';
import {
  mockAuth,
  mockGitHubAppAccount,
  mockOAuthAccount,
  mockPersonalAccessTokenAccount,
  mockSettings,
} from '../__mocks__/state-mocks';
import * as authUtils from '../utils/auth/utils';
import * as comms from '../utils/comms';
import * as links from '../utils/links';
import * as storage from '../utils/storage';
import { AccountsRoute } from './Accounts';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('renderer/routes/Accounts.tsx', () => {
  afterEach(() => {
    jest.clearAllMocks();
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
          settings: mockSettings,
        });
      });

      expect(screen.getByTestId('accounts')).toBeInTheDocument();
      expect(screen.getAllByTestId('account-profile')).toHaveLength(3);
    });

    it('should go back by pressing the icon', async () => {
      await act(async () => {
        renderWithAppContext(<AccountsRoute />, {
          auth: mockAuth,
          settings: mockSettings,
        });
      });

      await userEvent.click(screen.getByTestId('header-nav-back'));

      expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
    });
  });

  describe('Account interactions', () => {
    it('open profile in external browser', async () => {
      const openAccountProfileMock = jest
        .spyOn(links, 'openAccountProfile')
        .mockImplementation();

      await act(async () => {
        renderWithAppContext(<AccountsRoute />, {
          auth: { accounts: [mockPersonalAccessTokenAccount] },
          settings: mockSettings,
        });
      });

      await userEvent.click(screen.getByTestId('account-profile'));

      expect(openAccountProfileMock).toHaveBeenCalledTimes(1);
      expect(openAccountProfileMock).toHaveBeenCalledWith(
        mockPersonalAccessTokenAccount,
      );
    });

    it('open host in external browser', async () => {
      const openExternalLinkMock = jest
        .spyOn(comms, 'openExternalLink')
        .mockImplementation();

      await act(async () => {
        renderWithAppContext(<AccountsRoute />, {
          auth: { accounts: [mockPersonalAccessTokenAccount] },
          settings: mockSettings,
        });
      });

      await userEvent.click(screen.getByTestId('account-host'));

      expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
      expect(openExternalLinkMock).toHaveBeenCalledWith('https://github.com');
    });

    it('open developer settings in external browser', async () => {
      const openExternalLinkMock = jest
        .spyOn(comms, 'openExternalLink')
        .mockImplementation();

      await act(async () => {
        renderWithAppContext(<AccountsRoute />, {
          auth: { accounts: [mockPersonalAccessTokenAccount] },
          settings: mockSettings,
        });
      });

      await userEvent.click(screen.getByTestId('account-developer-settings'));

      expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
      expect(openExternalLinkMock).toHaveBeenCalledWith(
        'https://github.com/settings/tokens',
      );
    });

    it('should render with PAT scopes warning', async () => {
      const openExternalLinkMock = jest
        .spyOn(comms, 'openExternalLink')
        .mockImplementation();

      await act(async () => {
        renderWithAppContext(<AccountsRoute />, {
          auth: {
            accounts: [
              { ...mockPersonalAccessTokenAccount, hasRequiredScopes: false },
              mockOAuthAccount,
              mockGitHubAppAccount,
            ],
          },
          settings: mockSettings,
        });
      });

      expect(screen.getByTestId('accounts')).toBeInTheDocument();
      // All 3 accounts render the warning button, but only 1 is visible
      expect(screen.getAllByTestId('account-missing-scopes')).toHaveLength(3);

      await userEvent.click(screen.getAllByTestId('account-missing-scopes')[0]);

      expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
      expect(openExternalLinkMock).toHaveBeenCalledWith(
        'https://github.com/settings/tokens',
      );
    });

    it('should set account as primary account', async () => {
      const saveStateMock = jest
        .spyOn(storage, 'saveState')
        .mockImplementation();

      await act(async () => {
        renderWithAppContext(<AccountsRoute />, {
          auth: {
            accounts: [
              mockPersonalAccessTokenAccount,
              mockOAuthAccount,
              mockGitHubAppAccount,
            ],
          },
          settings: mockSettings,
        });
      });

      expect(screen.getByTestId('accounts')).toBeInTheDocument();
      // All 3 accounts render the primary/set-primary button
      expect(screen.getAllByTestId('account-set-primary')).toHaveLength(3);

      await userEvent.click(screen.getAllByTestId('account-set-primary')[0]);

      expect(saveStateMock).toHaveBeenCalled();
    });

    it('should refresh account', async () => {
      const refreshAccountMock = jest
        .spyOn(authUtils, 'refreshAccount')
        .mockImplementation();

      await act(async () => {
        renderWithAppContext(<AccountsRoute />, {
          auth: { accounts: [mockPersonalAccessTokenAccount] },
          settings: mockSettings,
        });
      });

      await userEvent.click(screen.getByTestId('account-refresh'));

      expect(refreshAccountMock).toHaveBeenCalledTimes(1);

      await waitFor(() =>
        expect(mockNavigate).toHaveBeenNthCalledWith(1, '/accounts', {
          replace: true,
        }),
      );
    });

    it('should logout', async () => {
      const logoutFromAccountMock = jest.fn();

      await act(async () => {
        renderWithAppContext(<AccountsRoute />, {
          auth: { accounts: [mockPersonalAccessTokenAccount] },
          settings: mockSettings,
          logoutFromAccount: logoutFromAccountMock,
        });
      });

      await userEvent.click(screen.getByTestId('account-logout'));

      expect(logoutFromAccountMock).toHaveBeenCalledTimes(1);

      expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
    });
  });

  describe('Add new accounts', () => {
    it('should show login with github app', async () => {
      const mockLoginWithGitHubApp = jest.fn();

      await act(async () => {
        renderWithAppContext(<AccountsRoute />, {
          auth: { accounts: [mockOAuthAccount] },
          settings: mockSettings,
          loginWithGitHubApp: mockLoginWithGitHubApp,
        });
      });

      await userEvent.click(screen.getByTestId('account-add-new'));
      await userEvent.click(screen.getByTestId('account-add-github'));

      expect(mockLoginWithGitHubApp).toHaveBeenCalled();
    });

    it('should show login with personal access token', async () => {
      await act(async () => {
        renderWithAppContext(<AccountsRoute />, {
          auth: { accounts: [mockOAuthAccount] },
          settings: mockSettings,
        });
      });

      await userEvent.click(screen.getByTestId('account-add-new'));
      await userEvent.click(screen.getByTestId('account-add-pat'));

      expect(mockNavigate).toHaveBeenNthCalledWith(
        1,
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
          settings: mockSettings,
        });
      });

      await userEvent.click(screen.getByTestId('account-add-new'));
      await userEvent.click(screen.getByTestId('account-add-oauth-app'));

      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/login-oauth-app', {
        replace: true,
      });
    });
  });
});
