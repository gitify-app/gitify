import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppContext } from '../context/App';
import type { AuthState, ClientID, ClientSecret, Hostname } from '../types';
import * as comms from '../utils/comms';
import { LoginWithOAuthAppRoute, validateForm } from './LoginWithOAuthApp';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('renderer/routes/LoginWithOAuthApp.tsx', () => {
  const mockLoginWithOAuthApp = jest.fn();

  const openExternalLinkMock = jest
    .spyOn(comms, 'openExternalLink')
    .mockImplementation();

  const mockAuth: AuthState = {
    accounts: [],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const tree = render(
      <AppContext.Provider value={{ auth: mockAuth }}>
        <MemoryRouter>
          <LoginWithOAuthAppRoute />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('let us go back', () => {
    render(
      <AppContext.Provider value={{ auth: mockAuth }}>
        <MemoryRouter>
          <LoginWithOAuthAppRoute />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.click(screen.getByTestId('header-nav-back'));

    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
  });

  it('should validate the form values', () => {
    const emptyValues = {
      hostname: null,
      clientId: null,
      clientSecret: null,
    };

    let values = {
      ...emptyValues,
    };
    expect(validateForm(values).hostname).toBe('Hostname is required');
    expect(validateForm(values).clientId).toBe('Client ID is required');
    expect(validateForm(values).clientSecret).toBe('Client Secret is required');

    values = {
      ...emptyValues,
      hostname: 'hello' as Hostname,
      clientId: '!@£INVALID-.1' as ClientID,
      clientSecret: '!@£INVALID-.1' as ClientSecret,
    };
    expect(validateForm(values).hostname).toBe('Hostname is invalid');
    expect(validateForm(values).clientId).toBe('Client ID format is invalid');
    expect(validateForm(values).clientSecret).toBe(
      'Client Secret format is invalid',
    );
  });

  describe("'Create new OAuth App' button", () => {
    it('should be disabled if no hostname configured', async () => {
      render(
        <AppContext.Provider value={{ auth: mockAuth }}>
          <MemoryRouter>
            <LoginWithOAuthAppRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      fireEvent.click(screen.getByTestId('login-create-oauth-app'));

      expect(openExternalLinkMock).toHaveBeenCalledTimes(0);
    });

    it('should open in browser if hostname configured', async () => {
      render(
        <AppContext.Provider value={{ auth: mockAuth }}>
          <MemoryRouter>
            <LoginWithOAuthAppRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      fireEvent.change(screen.getByLabelText('Hostname'), {
        target: { value: 'company.github.com' },
      });

      fireEvent.click(screen.getByTestId('login-create-oauth-app'));

      expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
    });
  });

  it('should login using a token - success', async () => {
    mockLoginWithOAuthApp.mockResolvedValueOnce(null);

    render(
      <AppContext.Provider
        value={{
          loginWithOAuthApp: mockLoginWithOAuthApp,
        }}
      >
        <MemoryRouter>
          <LoginWithOAuthAppRoute />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.change(screen.getByLabelText('Hostname'), {
      target: { value: 'github.com' },
    });
    fireEvent.change(screen.getByLabelText('Client ID'), {
      target: { value: '1234567890_ASDFGHJKL' },
    });
    fireEvent.change(screen.getByLabelText('Client Secret'), {
      target: { value: '1234567890_asdfghjklPOIUYTREWQ0987654321' },
    });

    fireEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() => expect(mockLoginWithOAuthApp).toHaveBeenCalledTimes(1));

    expect(mockLoginWithOAuthApp).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
  });

  it('should render the form with errors', () => {
    render(
      <AppContext.Provider value={{ auth: mockAuth }}>
        <MemoryRouter>
          <LoginWithOAuthAppRoute />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.change(screen.getByLabelText('Hostname'), {
      target: { value: 'test' },
    });
    fireEvent.change(screen.getByLabelText('Client ID'), {
      target: { value: '123' },
    });
    fireEvent.change(screen.getByLabelText('Client Secret'), {
      target: { value: 'abc' },
    });

    fireEvent.click(screen.getByTestId('login-submit'));

    expect(screen.getByText('Invalid hostname.')).toBeTruthy();
    expect(screen.getByText('Invalid client id.')).toBeTruthy();
    expect(screen.getByText('Invalid client secret.')).toBeTruthy();
  });

  it('should open help docs in the browser', async () => {
    render(
      <AppContext.Provider value={{ auth: mockAuth }}>
        <MemoryRouter>
          <LoginWithOAuthAppRoute />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.click(screen.getByTestId('login-docs'));

    expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
  });
});
