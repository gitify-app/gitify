import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../../__helpers__/test-utils';
import { mockGiteaAccount } from '../../__mocks__/account-mocks';

import type { Hostname } from '../../types';

import * as comms from '../../utils/system/comms';
import { GiteaLoginWithPersonalAccessTokenRoute } from './LoginWithPersonalAccessToken';

describe('renderer/routes/gitea/LoginWithPersonalAccessToken.tsx', () => {
  const loginWithPersonalAccessTokenMock = vi.fn();
  const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());

  it('renders the personal access token form', () => {
    renderWithProviders(<GiteaLoginWithPersonalAccessTokenRoute />);

    expect(
      screen.getByRole('heading', { name: 'Login to Gitea with Personal Access Token' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^Token/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open token settings' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('disables token settings and rejects credentials or paths in the origin', async () => {
    renderWithProviders(<GiteaLoginWithPersonalAccessTokenRoute />);
    await userEvent.type(
      screen.getByRole('textbox', { name: /^Hostname/ }),
      'http://user:secret@git.internal/path',
    );
    expect(screen.getByRole('button', { name: 'Open token settings' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(screen.getByText('Hostname format is invalid')).toBeInTheDocument();
  });

  it.each([
    ['gitea.example.com', 'https://gitea.example.com'],
    ['gitea.example.com:3000', 'https://gitea.example.com:3000'],
    ['http://git.internal:3000', 'http://git.internal:3000'],
  ])('opens token settings for %s', async (hostname, origin) => {
    renderWithProviders(<GiteaLoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    await userEvent.type(screen.getByRole('textbox', { name: /^Hostname/ }), hostname);

    await userEvent.click(screen.getByRole('button', { name: 'Open token settings' }));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(`${origin}/user/settings/applications`);
  });

  it.each(['gitea.example.com', 'gitea.example.com:3000', 'http://git.internal:3000'])(
    'logs in with %s',
    async (hostname) => {
      loginWithPersonalAccessTokenMock.mockResolvedValueOnce(null);

      renderWithProviders(<GiteaLoginWithPersonalAccessTokenRoute />, {
        loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
      });

      await userEvent.type(screen.getByRole('textbox', { name: /^Hostname/ }), hostname);

      await userEvent.type(
        screen.getByLabelText(/^Token/),
        'abcdef1234567890abcdef1234567890abcdef12',
      );

      await userEvent.click(screen.getByRole('button', { name: 'Login' }));

      await waitFor(() => {
        expect(loginWithPersonalAccessTokenMock).toHaveBeenCalledTimes(1);
        expect(loginWithPersonalAccessTokenMock).toHaveBeenCalledWith({
          hostname,
          token: 'abcdef1234567890abcdef1234567890abcdef12',
          forge: 'gitea',
        });
        expect(navigateMock).toHaveBeenCalledTimes(1);
        expect(navigateMock).toHaveBeenCalledWith('/');
      });
    },
  );

  it('logs in using a token - failure', async () => {
    loginWithPersonalAccessTokenMock.mockRejectedValueOnce(new Error('invalid token'));

    renderWithProviders(<GiteaLoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    await userEvent.type(screen.getByRole('textbox', { name: /^Hostname/ }), 'gitea.example.com');
    await userEvent.type(
      screen.getByLabelText(/^Token/),
      'abcdef1234567890abcdef1234567890abcdef12',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByTestId('login-errors')).toHaveTextContent(
        'Failed to validate provided token against gitea.example.com',
      );
      expect(navigateMock).not.toHaveBeenCalled();
    });
  });

  it('opens help docs in the browser', async () => {
    renderWithProviders(<GiteaLoginWithPersonalAccessTokenRoute />);

    await userEvent.click(screen.getByRole('button', { name: 'Docs' }));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://docs.gitea.com/development/api-usage',
    );
  });

  it('prefills hostname from the re-auth account in location state', () => {
    renderWithProviders(<GiteaLoginWithPersonalAccessTokenRoute />, {
      initialEntries: [
        {
          pathname: '/login/gitea/personal-access-token',
          state: {
            account: {
              ...mockGiteaAccount,
              hostname: 'codeberg.org' as Hostname,
            },
          },
        },
      ],
    });

    expect(screen.getByRole('textbox', { name: /^Hostname/ })).toHaveValue('codeberg.org');
  });
});
