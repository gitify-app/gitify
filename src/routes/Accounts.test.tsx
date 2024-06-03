import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  mockOAuthAccount,
  mockPersonalAccessTokenAccount,
  mockSettings,
} from '../__mocks__/state-mocks';
import { AppContext } from '../context/App';
import { AccountsRoute } from './Accounts';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('routes/Accounts.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login with Personal Access Token', () => {
    it('should show login with personal access token button if not logged in', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: { accounts: [mockOAuthAccount] },
              settings: mockSettings,
            }}
          >
            <MemoryRouter>
              <AccountsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      expect(screen.getByTitle('Login with Personal Access Token').hidden).toBe(
        false,
      );

      fireEvent.click(screen.getByTitle('Login with Personal Access Token'));
      expect(mockNavigate).toHaveBeenNthCalledWith(
        1,
        '/login-personal-access-token',
        {
          replace: true,
        },
      );
    });

    it('should hide login with personal access token button if already logged in', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: { accounts: [mockPersonalAccessTokenAccount] },
              settings: mockSettings,
            }}
          >
            <MemoryRouter>
              <AccountsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      expect(screen.getByTitle('Login with Personal Access Token').hidden).toBe(
        true,
      );
    });
  });

  describe('Login with OAuth App', () => {
    it('should show login with oauth app if not logged in', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: { accounts: [mockPersonalAccessTokenAccount] },
              settings: mockSettings,
            }}
          >
            <MemoryRouter>
              <AccountsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      expect(screen.getByTitle('Login with OAuth App').hidden).toBe(false);

      fireEvent.click(screen.getByTitle('Login with OAuth App'));
      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/login-oauth-app', {
        replace: true,
      });
    });

    it('should hide login with oauth app route if already logged in', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: { accounts: [mockOAuthAccount] },
              settings: mockSettings,
            }}
          >
            <MemoryRouter>
              <AccountsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      expect(screen.getByTitle('Login with OAuth App').hidden).toBe(true);
    });
  });
});
