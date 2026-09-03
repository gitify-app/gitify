import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../../__helpers__/test-utils';
import { mockGitLabAccount } from '../../__mocks__/account-mocks';

import {
  type IFormData,
  validateForm,
} from '../../components/login/LoginWithPersonalAccessTokenForm';

import type { Hostname, Token } from '../../types';

import * as comms from '../../utils/system/comms';
import { GitLabLoginWithPersonalAccessTokenRoute } from './LoginWithPersonalAccessToken';

describe('renderer/routes/gitlab/LoginWithPersonalAccessToken.tsx', () => {
  const loginWithPersonalAccessTokenMock = vi.fn();
  const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());

  const MODERN_TOKEN = 'glpat-cEj977iancWuTGoHQbbpGWM6MQpvOjEKdToxcDBrNw8.01.1711l2dhw' as Token;

  it('renders correctly', () => {
    const tree = renderWithProviders(<GitLabLoginWithPersonalAccessTokenRoute />);

    expect(tree.container).toMatchSnapshot();
  });

  it('prefills the hostname with gitlab.com', () => {
    renderWithProviders(<GitLabLoginWithPersonalAccessTokenRoute />);

    expect(screen.getByTestId('login-hostname')).toHaveValue('gitlab.com');
  });

  describe('form validation', () => {
    it('accepts the modern routing-prefixed token format', () => {
      const values: IFormData = {
        hostname: 'gitlab.com' as Hostname,
        token: MODERN_TOKEN,
      };

      expect(validateForm(values, 'gitlab')).toEqual({});
    });

    it('rejects an empty token', () => {
      const values: IFormData = {
        hostname: 'gitlab.com' as Hostname,
        token: '' as Token,
      };

      expect(validateForm(values, 'gitlab').token).toBe('Token is required');
    });

    it('rejects an invalid hostname', () => {
      const values: IFormData = {
        hostname: 'not a hostname' as Hostname,
        token: MODERN_TOKEN,
      };

      expect(validateForm(values, 'gitlab').hostname).toBe('Hostname format is invalid');
    });
  });

  it('should open the token settings for the configured hostname', async () => {
    renderWithProviders(<GitLabLoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    await userEvent.click(screen.getByTestId('login-create-token'));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://gitlab.com/-/user_settings/personal_access_tokens',
    );
  });

  it('should login using a token - success', async () => {
    loginWithPersonalAccessTokenMock.mockResolvedValueOnce(null);

    renderWithProviders(<GitLabLoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    await userEvent.type(screen.getByTestId('login-token'), MODERN_TOKEN);

    await userEvent.click(screen.getByTestId('login-submit'));

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

  it('should login using a token - failure', async () => {
    loginWithPersonalAccessTokenMock.mockRejectedValueOnce(
      new Error('GitLab API 403 Forbidden\nPRIVATE-TOKEN: leaked-pat'),
    );

    renderWithProviders(<GitLabLoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    await userEvent.type(screen.getByTestId('login-token'), MODERN_TOKEN);
    await userEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('login-errors')).toHaveTextContent(
        'Failed to validate provided token against gitlab.com',
      );
      expect(screen.getByTestId('login-errors')).toHaveTextContent('GitLab API 403 Forbidden');
      expect(screen.getByTestId('login-errors')).not.toHaveTextContent('leaked-pat');
      expect(navigateMock).not.toHaveBeenCalled();
    });
  });

  it('should open help docs in the browser', async () => {
    renderWithProviders(<GitLabLoginWithPersonalAccessTokenRoute />);

    await userEvent.click(screen.getByTestId('login-docs'));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith('https://docs.gitlab.com/api/todos/');
  });

  it('should prefill hostname from the re-auth account in location state', () => {
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

    expect(screen.getByTestId('login-hostname')).toHaveValue('gitlab.example.com');
  });
});
