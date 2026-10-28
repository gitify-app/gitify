import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../../__helpers__/test-utils';
import { mockPersonalAccessTokenAccount } from '../../__mocks__/account-mocks';

import type { Hostname } from '../../types';

import * as logger from '../../utils/core/logger';
import * as comms from '../../utils/system/comms';
import { GitHubLoginWithPersonalAccessTokenRoute } from './LoginWithPersonalAccessToken';

describe('renderer/routes/github/LoginWithPersonalAccessToken.tsx', () => {
  const loginWithPersonalAccessTokenMock = vi.fn();
  const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());

  it('renders the personal access token form', () => {
    renderWithProviders(<GitHubLoginWithPersonalAccessTokenRoute />);

    expect(
      screen.getByRole('heading', { name: 'Login with Personal Access Token' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^Token/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate a PAT' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('let us go back', async () => {
    renderWithProviders(<GitHubLoginWithPersonalAccessTokenRoute />);

    await userEvent.click(screen.getByRole('button', { name: 'Go back' }));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  describe("'Generate a PAT' button", () => {
    it('is disabled if no hostname configured', async () => {
      renderWithProviders(<GitHubLoginWithPersonalAccessTokenRoute />, {
        loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
      });

      await userEvent.clear(screen.getByRole('textbox', { name: /^Hostname/ }));

      await userEvent.click(screen.getByRole('button', { name: 'Generate a PAT' }));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(0);
    });

    it('opens in browser if hostname configured', async () => {
      renderWithProviders(<GitHubLoginWithPersonalAccessTokenRoute />, {
        loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
      });

      await userEvent.click(screen.getByRole('button', { name: 'Generate a PAT' }));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('logs in using a token - success', async () => {
    loginWithPersonalAccessTokenMock.mockResolvedValueOnce(null);

    renderWithProviders(<GitHubLoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    const hostname = screen.getByRole('textbox', { name: /^Hostname/ });
    await userEvent.clear(hostname);
    await userEvent.type(hostname, 'github.com');

    await userEvent.type(
      screen.getByLabelText(/^Token/),
      '1234567890123456789012345678901234567890',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

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

  it('logs in using a token - failure', async () => {
    const rendererLogErrorSpy = vi.spyOn(logger, 'rendererLogError').mockImplementation(vi.fn());
    loginWithPersonalAccessTokenMock.mockRejectedValueOnce(null);

    renderWithProviders(<GitHubLoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    const hostname = screen.getByRole('textbox', { name: /^Hostname/ });
    await userEvent.clear(hostname);
    await userEvent.type(hostname, 'github.com');

    await userEvent.type(
      screen.getByLabelText(/^Token/),
      '1234567890123456789012345678901234567890',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(loginWithPersonalAccessTokenMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledTimes(0);
      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('login-errors')).toHaveTextContent(
        'Failed to validate provided token against github.com',
      );
      expect(screen.getByTestId('login-errors')).not.toHaveTextContent('null');
    });
  });

  it('renders the form with errors', async () => {
    renderWithProviders(<GitHubLoginWithPersonalAccessTokenRoute />);

    const hostname = screen.getByRole('textbox', { name: /^Hostname/ });
    await userEvent.clear(hostname);
    await userEvent.type(hostname, 'test');

    await userEvent.type(screen.getByLabelText(/^Token/), '123');

    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(screen.getByText('Hostname format is invalid')).toBeInTheDocument();
    expect(screen.getByText('Token format is invalid')).toBeInTheDocument();
  });

  it('opens help docs in the browser', async () => {
    renderWithProviders(<GitHubLoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Docs' }));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
  });

  it('toggles token visibility', async () => {
    renderWithProviders(<GitHubLoginWithPersonalAccessTokenRoute />);

    const tokenInput = screen.getByLabelText(/^Token/);
    expect(tokenInput).toHaveAttribute('type', 'password');

    await userEvent.click(screen.getByLabelText('Show token'));
    expect(tokenInput).toHaveAttribute('type', 'text');

    await userEvent.click(screen.getByLabelText('Hide token'));
    expect(tokenInput).toHaveAttribute('type', 'password');
  });

  it('prefills hostname from the re-auth account in location state', () => {
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

    expect(screen.getByRole('textbox', { name: /^Hostname/ })).toHaveValue(
      'github.enterprise.example',
    );
  });
});
