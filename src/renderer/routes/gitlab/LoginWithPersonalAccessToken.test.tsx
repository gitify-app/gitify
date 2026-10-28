import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../../__helpers__/test-utils';
import { mockGitLabAccount } from '../../__mocks__/account-mocks';

import type { Hostname, Token } from '../../types';

import * as comms from '../../utils/system/comms';
import { GitLabLoginWithPersonalAccessTokenRoute } from './LoginWithPersonalAccessToken';

describe('renderer/routes/gitlab/LoginWithPersonalAccessToken.tsx', () => {
  const loginWithPersonalAccessTokenMock = vi.fn();
  const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());

  const MODERN_TOKEN = 'glpat-cEj977iancWuTGoHQbbpGWM6MQpvOjEKdToxcDBrNw8.01.1711l2dhw' as Token;

  it('renders the personal access token form', () => {
    renderWithProviders(<GitLabLoginWithPersonalAccessTokenRoute />);

    expect(
      screen.getByRole('heading', { name: 'Login to GitLab with Personal Access Token' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^Token/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open token settings' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('prefills the hostname with gitlab.com', () => {
    renderWithProviders(<GitLabLoginWithPersonalAccessTokenRoute />);

    expect(screen.getByRole('textbox', { name: /^Hostname/ })).toHaveValue('gitlab.com');
  });

  it('opens the token settings for the configured hostname', async () => {
    renderWithProviders(<GitLabLoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Open token settings' }));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://gitlab.com/-/user_settings/personal_access_tokens',
    );
  });

  it('logs in using a token - success', async () => {
    loginWithPersonalAccessTokenMock.mockResolvedValueOnce(null);

    renderWithProviders(<GitLabLoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    await userEvent.type(screen.getByLabelText(/^Token/), MODERN_TOKEN);

    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(loginWithPersonalAccessTokenMock).toHaveBeenCalledTimes(1);
      expect(loginWithPersonalAccessTokenMock).toHaveBeenCalledWith({
        hostname: 'gitlab.com',
        token: MODERN_TOKEN,
        forge: 'gitlab',
      });
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  it('logs in using a token - failure', async () => {
    loginWithPersonalAccessTokenMock.mockRejectedValueOnce(
      new Error('GitLab API 403 Forbidden\nPRIVATE-TOKEN: leaked-pat'),
    );

    renderWithProviders(<GitLabLoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    await userEvent.type(screen.getByLabelText(/^Token/), MODERN_TOKEN);
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByTestId('login-errors')).toHaveTextContent(
        'Failed to validate provided token against gitlab.com',
      );
      expect(screen.getByTestId('login-errors')).toHaveTextContent('GitLab API 403 Forbidden');
      expect(screen.getByTestId('login-errors')).not.toHaveTextContent('leaked-pat');
      expect(navigateMock).not.toHaveBeenCalled();
    });
  });

  it('opens help docs in the browser', async () => {
    renderWithProviders(<GitLabLoginWithPersonalAccessTokenRoute />);

    await userEvent.click(screen.getByRole('button', { name: 'Docs' }));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith('https://docs.gitlab.com/api/todos/');
  });

  it('prefills hostname from the re-auth account in location state', () => {
    renderWithProviders(<GitLabLoginWithPersonalAccessTokenRoute />, {
      initialEntries: [
        {
          pathname: '/login/gitlab/personal-access-token',
          state: {
            account: {
              ...mockGitLabAccount,
              hostname: 'gitlab.example.com' as Hostname,
            },
          },
        },
      ],
    });

    expect(screen.getByRole('textbox', { name: /^Hostname/ })).toHaveValue('gitlab.example.com');
  });
});
