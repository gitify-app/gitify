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

  it('login with personal access token', async () => {
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

  it('login with oauth app', async () => {
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
});
