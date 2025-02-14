import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
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

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

describe('renderer/routes/Accounts.tsx', () => {
  afterEach(() => {
    vi.clearAllMocks();
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

      fireEvent.click(screen.getByTestId('header-nav-back'));

      expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
    });
  });

  describe('Account interactions', () => {
    it('open profile in external browser', async () => {
      const openAccountProfileMock = vi
        .spyOn(links, 'openAccountProfile')
        .mockImplementation(vi.fn());

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

      fireEvent.click(screen.getByTestId('account-profile'));

      expect(openAccountProfileMock).toHaveBeenCalledTimes(1);
      expect(openAccountProfileMock).toHaveBeenCalledWith(
        mockPersonalAccessTokenAccount,
      );
    });

    it('open host in external browser', async () => {
      const openExternalLinkMock = vi
        .spyOn(comms, 'openExternalLink')
        .mockImplementation(vi.fn());

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

      fireEvent.click(screen.getByTestId('account-host'));

      expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
      expect(openExternalLinkMock).toHaveBeenCalledWith('https://github.com');
    });

    it('open developer settings in external browser', async () => {
      const openExternalLinkMock = vi
        .spyOn(comms, 'openExternalLink')
        .mockImplementation(vi.fn());

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

      fireEvent.click(screen.getByTestId('account-developer-settings'));

      expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
      expect(openExternalLinkMock).toHaveBeenCalledWith(
        'https://github.com/settings/tokens',
      );
    });

    it('should render with PAT scopes warning', async () => {
      const openExternalLinkMock = vi
        .spyOn(comms, 'openExternalLink')
        .mockImplementation(vi.fn());

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

      fireEvent.click(screen.getAllByTestId('account-missing-scopes')[0]);

      expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
      expect(openExternalLinkMock).toHaveBeenCalledWith(
        'https://github.com/settings/tokens',
      );
    });

    it('should set account as primary account', async () => {
      const saveStateMock = vi
        .spyOn(storage, 'saveState')
        .mockImplementation(vi.fn());

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

      fireEvent.click(screen.getAllByTestId('account-set-primary')[0]);

      expect(saveStateMock).toHaveBeenCalled();
    });

    it('should refresh account', async () => {
      const apiRequestAuthMock = vi.spyOn(apiRequests, 'apiRequestAuth');

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

      fireEvent.click(screen.getByTestId('account-refresh'));

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
      const logoutFromAccountMock = vi.fn();
      const updateTrayIconMock = vi.spyOn(comms, 'updateTrayIcon');
      const updateTrayTitleMock = vi.spyOn(comms, 'updateTrayTitle');

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

      fireEvent.click(screen.getByTestId('account-logout'));

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
      const mockLoginWithGitHubApp = vi.fn();

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

      fireEvent.click(screen.getByTestId('account-add-new'));
      fireEvent.click(screen.getByTestId('account-add-github'));

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

      fireEvent.click(screen.getByTestId('account-add-new'));
      fireEvent.click(screen.getByTestId('account-add-pat'));

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

      fireEvent.click(screen.getByTestId('account-add-new'));
      fireEvent.click(screen.getByTestId('account-add-oauth-app'));

      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/login-oauth-app', {
        replace: true,
      });
    });
  });
});
