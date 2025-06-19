import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { BaseStyles, ThemeProvider } from '@primer/react';

import {
  mockAuth,
  mockGitHubAppAccount,
  mockOAuthAccount,
  mockPersonalAccessTokenAccount,
  mockSettings,
} from '../__mocks__/state-mocks';
import { AppContext } from '../context/App';
import * as apiRequests from '../utils/api/request';
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
        render(
          <AppContext.Provider
            value={{
              auth: {
                accounts: [
                  mockPersonalAccessTokenAccount,
                  mockOAuthAccount,
                  mockGitHubAppAccount,
                ],
              },
              settings: mockSettings,
            }}
          >
            <MemoryRouter>
              <AccountsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      expect(screen.getByTestId('accounts')).toMatchSnapshot();
    });

    it('should go back by pressing the icon', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: mockAuth,
              settings: mockSettings,
            }}
          >
            <MemoryRouter>
              <AccountsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
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
        render(
          <AppContext.Provider
            value={{
              auth: {
                accounts: [mockPersonalAccessTokenAccount],
              },
              settings: mockSettings,
            }}
          >
            <MemoryRouter>
              <AccountsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
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
        render(
          <AppContext.Provider
            value={{
              auth: {
                accounts: [mockPersonalAccessTokenAccount],
              },
              settings: mockSettings,
            }}
          >
            <MemoryRouter>
              <AccountsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
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
        render(
          <AppContext.Provider
            value={{
              auth: {
                accounts: [mockPersonalAccessTokenAccount],
              },
              settings: mockSettings,
            }}
          >
            <MemoryRouter>
              <AccountsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
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
        render(
          <AppContext.Provider
            value={{
              auth: {
                accounts: [
                  {
                    ...mockPersonalAccessTokenAccount,
                    hasRequiredScopes: false,
                  },
                  mockOAuthAccount,
                  mockGitHubAppAccount,
                ],
              },
              settings: mockSettings,
            }}
          >
            <MemoryRouter>
              <AccountsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      expect(screen.getByTestId('accounts')).toMatchSnapshot();

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
        render(
          <AppContext.Provider
            value={{
              auth: {
                accounts: [
                  mockPersonalAccessTokenAccount,
                  mockOAuthAccount,
                  mockGitHubAppAccount,
                ],
              },
              settings: mockSettings,
            }}
          >
            <MemoryRouter>
              <AccountsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      expect(screen.getByTestId('accounts')).toMatchSnapshot();

      await userEvent.click(screen.getAllByTestId('account-set-primary')[0]);

      expect(saveStateMock).toHaveBeenCalled();
    });

    it('should refresh account', async () => {
      const apiRequestAuthMock = jest.spyOn(apiRequests, 'apiRequestAuth');

      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: {
                accounts: [mockPersonalAccessTokenAccount],
              },
              settings: mockSettings,
            }}
          >
            <MemoryRouter>
              <AccountsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      await userEvent.click(screen.getByTestId('account-refresh'));

      expect(apiRequestAuthMock).toHaveBeenCalledTimes(1);
      expect(apiRequestAuthMock).toHaveBeenCalledWith(
        'https://api.github.com/user',
        'GET',
        'token-123-456',
      );
      await waitFor(() =>
        expect(mockNavigate).toHaveBeenNthCalledWith(1, '/accounts', {
          replace: true,
        }),
      );
    });

    it('should logout', async () => {
      const logoutFromAccountMock = jest.fn();
      const updateTrayIconMock = jest.spyOn(comms, 'updateTrayIcon');
      const updateTrayTitleMock = jest.spyOn(comms, 'updateTrayTitle');

      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: {
                accounts: [mockPersonalAccessTokenAccount],
              },
              settings: mockSettings,
              logoutFromAccount: logoutFromAccountMock,
            }}
          >
            <MemoryRouter>
              <AccountsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      await userEvent.click(screen.getByTestId('account-logout'));

      expect(logoutFromAccountMock).toHaveBeenCalledTimes(1);
      expect(updateTrayIconMock).toHaveBeenCalledTimes(1);
      expect(updateTrayIconMock).toHaveBeenCalledWith();
      expect(updateTrayTitleMock).toHaveBeenCalledTimes(1);
      expect(updateTrayTitleMock).toHaveBeenCalledWith();
      expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
    });
  });

  describe('Add new accounts', () => {
    it('should show login with github app', async () => {
      const mockLoginWithGitHubApp = jest.fn();

      await act(async () => {
        render(
          <ThemeProvider>
            <BaseStyles>
              <AppContext.Provider
                value={{
                  auth: { accounts: [mockOAuthAccount] },
                  settings: mockSettings,
                  loginWithGitHubApp: mockLoginWithGitHubApp,
                }}
              >
                <MemoryRouter>
                  <AccountsRoute />
                </MemoryRouter>
              </AppContext.Provider>
            </BaseStyles>
          </ThemeProvider>,
        );
      });

      await userEvent.click(screen.getByTestId('account-add-new'));
      await userEvent.click(screen.getByTestId('account-add-github'));

      expect(mockLoginWithGitHubApp).toHaveBeenCalled();
    });

    it('should show login with personal access token', async () => {
      await act(async () => {
        render(
          <ThemeProvider>
            <BaseStyles>
              <AppContext.Provider
                value={{
                  auth: { accounts: [mockOAuthAccount] },
                  settings: mockSettings,
                }}
              >
                <MemoryRouter>
                  <AccountsRoute />
                </MemoryRouter>
              </AppContext.Provider>
            </BaseStyles>
          </ThemeProvider>,
        );
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
        render(
          <ThemeProvider>
            <BaseStyles>
              <AppContext.Provider
                value={{
                  auth: { accounts: [mockPersonalAccessTokenAccount] },
                  settings: mockSettings,
                }}
              >
                <MemoryRouter>
                  <AccountsRoute />
                </MemoryRouter>
              </AppContext.Provider>
            </BaseStyles>
          </ThemeProvider>,
        );
      });

      await userEvent.click(screen.getByTestId('account-add-new'));
      await userEvent.click(screen.getByTestId('account-add-oauth-app'));

      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/login-oauth-app', {
        replace: true,
      });
    });
  });
});
