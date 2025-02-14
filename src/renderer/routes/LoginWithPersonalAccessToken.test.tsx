import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppContext } from '../context/App';
import * as comms from '../utils/comms';
import {
  LoginWithPersonalAccessTokenRoute,
  validateForm,
} from './LoginWithPersonalAccessToken';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

describe('renderer/routes/LoginWithPersonalAccessToken.tsx', () => {
  const mockLoginWithPersonalAccessToken = vi.fn();
  const openExternalLinkMock = vi
    .spyOn(comms, 'openExternalLink')
    .mockImplementation(vi.fn());

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const tree = render(
      <MemoryRouter>
        <LoginWithPersonalAccessTokenRoute />
      </MemoryRouter>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('let us go back', () => {
    render(
      <MemoryRouter>
        <LoginWithPersonalAccessTokenRoute />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId('header-nav-back'));

    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
  });

  it('should validate the form values', () => {
    const emptyValues = {
      hostname: null,
      token: null,
    };

    let values = {
      ...emptyValues,
    };
    expect(validateForm(values).hostname).toBe('Hostname is required');
    expect(validateForm(values).token).toBe('Token is required');

    values = {
      ...emptyValues,
      hostname: 'hello',
      token: '!@£INVALID-.1',
    };
    expect(validateForm(values).hostname).toBe('Hostname format is invalid');
    expect(validateForm(values).token).toBe('Token format is invalid');
  });

  describe("'Generate a PAT' button", () => {
    it('should be disabled if no hostname configured', async () => {
      render(
        <AppContext.Provider
          value={{
            loginWithPersonalAccessToken: mockLoginWithPersonalAccessToken,
          }}
        >
          <MemoryRouter>
            <LoginWithPersonalAccessTokenRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      fireEvent.change(screen.getByTestId('login-hostname'), {
        target: { value: '' },
      });

      fireEvent.click(screen.getByTestId('login-create-token'));

      expect(openExternalLinkMock).toHaveBeenCalledTimes(0);
    });

    it('should open in browser if hostname configured', async () => {
      render(
        <AppContext.Provider
          value={{
            loginWithPersonalAccessToken: mockLoginWithPersonalAccessToken,
          }}
        >
          <MemoryRouter>
            <LoginWithPersonalAccessTokenRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      fireEvent.click(screen.getByTestId('login-create-token'));

      expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
    });
  });

  it('should login using a token - success', async () => {
    mockLoginWithPersonalAccessToken.mockResolvedValueOnce(null);

    render(
      <AppContext.Provider
        value={{
          loginWithPersonalAccessToken: mockLoginWithPersonalAccessToken,
        }}
      >
        <MemoryRouter>
          <LoginWithPersonalAccessTokenRoute />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.change(screen.getByTestId('login-hostname'), {
      target: { value: 'github.com' },
    });

    fireEvent.change(screen.getByTestId('login-token'), {
      target: { value: '1234567890123456789012345678901234567890' },
    });

    fireEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() =>
      expect(mockLoginWithPersonalAccessToken).toHaveBeenCalledTimes(1),
    );

    expect(mockLoginWithPersonalAccessToken).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
  });

  it('should login using a token - failure', async () => {
    mockLoginWithPersonalAccessToken.mockRejectedValueOnce(null);

    render(
      <AppContext.Provider
        value={{
          loginWithPersonalAccessToken: mockLoginWithPersonalAccessToken,
        }}
      >
        <MemoryRouter>
          <LoginWithPersonalAccessTokenRoute />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.change(screen.getByTestId('login-hostname'), {
      target: { value: 'github.com' },
    });

    fireEvent.change(screen.getByTestId('login-token'), {
      target: { value: '1234567890123456789012345678901234567890' },
    });

    fireEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() =>
      expect(mockLoginWithPersonalAccessToken).toHaveBeenCalledTimes(1),
    );

    expect(mockLoginWithPersonalAccessToken).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(0);
  });

  it('should render the form with errors', () => {
    render(
      <MemoryRouter>
        <LoginWithPersonalAccessTokenRoute />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByTestId('login-hostname'), {
      target: { value: 'test' },
    });
    fireEvent.change(screen.getByTestId('login-token'), {
      target: { value: '123' },
    });

    fireEvent.click(screen.getByTestId('login-submit'));

    expect(screen.getByTestId('login-errors')).toBeTruthy();
    expect(screen.getByText('Hostname format is invalid')).toBeTruthy();
    expect(screen.getByText('Token format is invalid')).toBeTruthy();
  });

  it('should open help docs in the browser', async () => {
    render(
      <AppContext.Provider
        value={{
          loginWithPersonalAccessToken: mockLoginWithPersonalAccessToken,
        }}
      >
        <MemoryRouter>
          <LoginWithPersonalAccessTokenRoute />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.click(screen.getByTestId('login-docs'));

    expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
  });
});
