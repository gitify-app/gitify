import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../__helpers__/test-utils';

import type { Hostname, Token } from '../types';

import * as comms from '../utils/comms';
import * as logger from '../utils/logger';
import {
  type IFormData,
  LoginWithPersonalAccessTokenRoute,
  validateForm,
} from './LoginWithPersonalAccessToken';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => navigateMock,
}));

describe('renderer/routes/LoginWithPersonalAccessToken.tsx', () => {
  const loginWithPersonalAccessTokenMock = vi.fn();
  const openExternalLinkSpy = vi
    .spyOn(comms, 'openExternalLink')
    .mockImplementation(vi.fn());

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const tree = renderWithAppContext(<LoginWithPersonalAccessTokenRoute />);

    expect(tree.container).toMatchSnapshot();
  });

  it('let us go back', async () => {
    renderWithAppContext(<LoginWithPersonalAccessTokenRoute />);

    await userEvent.click(screen.getByTestId('header-nav-back'));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  describe('form validation', () => {
    it('should validate the form values are not empty', () => {
      const values: IFormData = {
        hostname: null,
        token: null,
      };
      expect(validateForm(values).hostname).toBe('Hostname is required');
      expect(validateForm(values).token).toBe('Token is required');
    });

    it('should validate the form values are correct format', () => {
      const values: IFormData = {
        hostname: 'hello' as Hostname,
        token: '!@£INVALID-.1' as Token,
      };

      expect(validateForm(values).hostname).toBe('Hostname format is invalid');
      expect(validateForm(values).token).toBe('Token format is invalid');
    });
  });

  describe("'Generate a PAT' button", () => {
    it('should be disabled if no hostname configured', async () => {
      renderWithAppContext(<LoginWithPersonalAccessTokenRoute />, {
        loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
      });

      await userEvent.clear(screen.getByTestId('login-hostname'));

      await userEvent.click(screen.getByTestId('login-create-token'));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(0);
    });

    it('should open in browser if hostname configured', async () => {
      renderWithAppContext(<LoginWithPersonalAccessTokenRoute />, {
        loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
      });

      await userEvent.click(screen.getByTestId('login-create-token'));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('should login using a token - success', async () => {
    loginWithPersonalAccessTokenMock.mockResolvedValueOnce(null);

    renderWithAppContext(<LoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    const hostname = screen.getByTestId('login-hostname');
    await userEvent.clear(hostname);
    await userEvent.type(hostname, 'github.com');

    await userEvent.type(
      screen.getByTestId('login-token'),
      '1234567890123456789012345678901234567890',
    );

    await userEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(loginWithPersonalAccessTokenMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith(-1);
    });
  });

  it('should login using a token - failure', async () => {
    const rendererLogErrorSpy = vi
      .spyOn(logger, 'rendererLogError')
      .mockImplementation(vi.fn());
    loginWithPersonalAccessTokenMock.mockRejectedValueOnce(null);

    renderWithAppContext(<LoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    const hostname = screen.getByTestId('login-hostname');
    await userEvent.clear(hostname);
    await userEvent.type(hostname, 'github.com');

    await userEvent.type(
      screen.getByTestId('login-token'),
      '1234567890123456789012345678901234567890',
    );

    await userEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(loginWithPersonalAccessTokenMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledTimes(0);
      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('should render the form with errors', async () => {
    renderWithAppContext(<LoginWithPersonalAccessTokenRoute />);

    const hostname = screen.getByTestId('login-hostname');
    await userEvent.clear(hostname);
    await userEvent.type(hostname, 'test');

    await userEvent.type(screen.getByTestId('login-token'), '123');

    await userEvent.click(screen.getByTestId('login-submit'));

    expect(screen.getByText('Hostname format is invalid')).toBeInTheDocument();
    expect(screen.getByText('Token format is invalid')).toBeInTheDocument();
  });

  it('should open help docs in the browser', async () => {
    renderWithAppContext(<LoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    await userEvent.click(screen.getByTestId('login-docs'));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
  });
});
