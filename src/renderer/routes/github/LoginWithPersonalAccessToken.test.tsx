import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../../__helpers__/test-utils';
import { mockPersonalAccessTokenAccount } from '../../__mocks__/account-mocks';

import {
  type IFormData,
  validateForm,
} from '../../components/login/LoginWithPersonalAccessTokenForm';

import type { Hostname, Token } from '../../types';

import * as logger from '../../utils/core/logger';
import * as comms from '../../utils/system/comms';
import { GitHubLoginWithPersonalAccessTokenRoute } from './LoginWithPersonalAccessToken';

describe('renderer/routes/github/LoginWithPersonalAccessToken.tsx', () => {
  const loginWithPersonalAccessTokenMock = vi.fn();
  const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());

  it('renders correctly', () => {
    const tree = renderWithProviders(<GitHubLoginWithPersonalAccessTokenRoute />);

    expect(tree.container).toMatchSnapshot();
  });

  it('let us go back', async () => {
    renderWithProviders(<GitHubLoginWithPersonalAccessTokenRoute />);

    await userEvent.click(screen.getByTestId('header-nav-back'));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  describe('form validation', () => {
    it('should validate the form values are not empty', () => {
      const values: IFormData = {
        hostname: null as unknown as Hostname,
        token: null as unknown as Token,
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
      renderWithProviders(<GitHubLoginWithPersonalAccessTokenRoute />, {
        loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
      });

      await userEvent.clear(screen.getByTestId('login-hostname'));

      await userEvent.click(screen.getByTestId('login-create-token'));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(0);
    });

    it('should open in browser if hostname configured', async () => {
      renderWithProviders(<GitHubLoginWithPersonalAccessTokenRoute />, {
        loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
      });

      await userEvent.click(screen.getByTestId('login-create-token'));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('should login using a token - success', async () => {
    loginWithPersonalAccessTokenMock.mockResolvedValueOnce(null);

    renderWithProviders(<GitHubLoginWithPersonalAccessTokenRoute />, {
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
      expect(loginWithPersonalAccessTokenMock).toHaveBeenCalledWith({
        hostname: 'github.com',
        token: '1234567890123456789012345678901234567890',
        forge: 'github',
      });
      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  it('should login using a token - failure', async () => {
    const rendererLogErrorSpy = vi.spyOn(logger, 'rendererLogError').mockImplementation(vi.fn());
    loginWithPersonalAccessTokenMock.mockRejectedValueOnce(null);

    renderWithProviders(<GitHubLoginWithPersonalAccessTokenRoute />, {
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
      expect(screen.getByTestId('login-errors')).toHaveTextContent(
        'Failed to validate provided token against github.com',
      );
    });
  });

  it('should render the form with errors', async () => {
    renderWithProviders(<GitHubLoginWithPersonalAccessTokenRoute />);

    const hostname = screen.getByTestId('login-hostname');
    await userEvent.clear(hostname);
    await userEvent.type(hostname, 'test');

    await userEvent.type(screen.getByTestId('login-token'), '123');

    await userEvent.click(screen.getByTestId('login-submit'));

    expect(screen.getByText('Hostname format is invalid')).toBeInTheDocument();
    expect(screen.getByText('Token format is invalid')).toBeInTheDocument();
  });

  it('should open help docs in the browser', async () => {
    renderWithProviders(<GitHubLoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    await userEvent.click(screen.getByTestId('login-docs'));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
  });

  it('should toggle token visibility', async () => {
    renderWithProviders(<GitHubLoginWithPersonalAccessTokenRoute />);

    const tokenInput = screen.getByTestId('login-token');
    expect(tokenInput).toHaveAttribute('type', 'password');

    await userEvent.click(screen.getByLabelText('Show token'));
    expect(tokenInput).toHaveAttribute('type', 'text');

    await userEvent.click(screen.getByLabelText('Hide token'));
    expect(tokenInput).toHaveAttribute('type', 'password');
  });

  it('should prefill hostname from the re-auth account in location state', () => {
    renderWithProviders(<GitHubLoginWithPersonalAccessTokenRoute />, {
      initialEntries: [
        {
          pathname: '/login/github/personal-access-token',
          state: {
            account: {
              ...mockPersonalAccessTokenAccount,
              hostname: 'github.enterprise.example' as Hostname,
            },
          },
        },
      ],
    });

    expect(screen.getByTestId('login-hostname')).toHaveValue('github.enterprise.example');
  });
});
