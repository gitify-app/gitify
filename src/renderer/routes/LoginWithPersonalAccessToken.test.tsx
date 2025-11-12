import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppContext } from '../context/App';
import * as comms from '../utils/comms';
import {
  LoginWithPersonalAccessTokenRoute,
  validateForm,
} from './LoginWithPersonalAccessToken';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('renderer/routes/LoginWithPersonalAccessToken.tsx', () => {
  const mockLoginWithPersonalAccessToken = vi.fn();
  const openExternalLinkMock = vi
    .spyOn(comms, 'openExternalLink')
    .mockImplementation();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const tree = render(<LoginWithPersonalAccessTokenRoute />);

    expect(tree).toMatchSnapshot();
  });

  it('let us go back', async () => {
    render(<LoginWithPersonalAccessTokenRoute />);

    await userEvent.click(screen.getByTestId('header-nav-back'));

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
          <LoginWithPersonalAccessTokenRoute />
        </AppContext.Provider>,
      );

      await userEvent.clear(screen.getByTestId('login-hostname'));

      await userEvent.click(screen.getByTestId('login-create-token'));

      expect(openExternalLinkMock).toHaveBeenCalledTimes(0);
    });

    it('should open in browser if hostname configured', async () => {
      render(
        <AppContext.Provider
          value={{
            loginWithPersonalAccessToken: mockLoginWithPersonalAccessToken,
          }}
        >
          <LoginWithPersonalAccessTokenRoute />
        </AppContext.Provider>,
      );

      await userEvent.click(screen.getByTestId('login-create-token'));

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
        <LoginWithPersonalAccessTokenRoute />
      </AppContext.Provider>,
    );

    const hostname = screen.getByTestId('login-hostname');
    await userEvent.clear(hostname);
    await userEvent.type(hostname, 'github.com');

    await userEvent.type(
      screen.getByTestId('login-token'),
      '1234567890123456789012345678901234567890',
    );

    await userEvent.click(screen.getByTestId('login-submit'));

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
        <LoginWithPersonalAccessTokenRoute />
      </AppContext.Provider>,
    );

    const hostname = screen.getByTestId('login-hostname');
    await userEvent.clear(hostname);
    await userEvent.type(hostname, 'github.com');

    await userEvent.type(
      screen.getByTestId('login-token'),
      '1234567890123456789012345678901234567890',
    );

    await userEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() =>
      expect(mockLoginWithPersonalAccessToken).toHaveBeenCalledTimes(1),
    );

    expect(mockLoginWithPersonalAccessToken).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(0);
  });

  it('should render the form with errors', async () => {
    render(<LoginWithPersonalAccessTokenRoute />);

    const hostname = screen.getByTestId('login-hostname');
    await userEvent.clear(hostname);
    await userEvent.type(hostname, 'test');

    await userEvent.type(screen.getByTestId('login-token'), '123');

    await userEvent.click(screen.getByTestId('login-submit'));

    expect(screen.getByTestId('login-errors')).toBeInTheDocument();
    expect(screen.getByText('Hostname format is invalid')).toBeInTheDocument();
    expect(screen.getByText('Token format is invalid')).toBeInTheDocument();
  });

  it('should open help docs in the browser', async () => {
    render(
      <AppContext.Provider
        value={{
          loginWithPersonalAccessToken: mockLoginWithPersonalAccessToken,
        }}
      >
        <LoginWithPersonalAccessTokenRoute />
      </AppContext.Provider>,
    );

    await userEvent.click(screen.getByTestId('login-docs'));

    expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
  });
});
