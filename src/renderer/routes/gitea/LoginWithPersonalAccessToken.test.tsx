import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../../__helpers__/test-utils';
import { mockGiteaAccount } from '../../__mocks__/account-mocks';

import {
  type IFormData,
  validateForm,
} from '../../components/login/LoginWithPersonalAccessTokenForm';

import type { Hostname, Token } from '../../types';

import * as comms from '../../utils/system/comms';
import { GiteaLoginWithPersonalAccessTokenRoute } from './LoginWithPersonalAccessToken';

describe('renderer/routes/gitea/LoginWithPersonalAccessToken.tsx', () => {
  const loginWithPersonalAccessTokenMock = vi.fn();
  const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());

  it('renders correctly', () => {
    const tree = renderWithProviders(<GiteaLoginWithPersonalAccessTokenRoute />);

    expect(tree.container).toMatchSnapshot();
  });

  describe('form validation', () => {
    it('should validate the token matches the Gitea format', () => {
      const values: IFormData = {
        hostname: 'gitea.example.com' as Hostname,
        token: 'abcdef1234567890abcdef1234567890abcdef12' as Token,
      };

      expect(validateForm(values, 'gitea')).toEqual({});
    });

    it('should reject tokens that are not 40-character lowercase hex', () => {
      const values: IFormData = {
        hostname: 'gitea.example.com' as Hostname,
        token: 'GHT_INVALID_TOKEN' as Token,
      };

      expect(validateForm(values, 'gitea').token).toBe('Token format is invalid');
    });
  });

  it('should open the token settings for the configured hostname', async () => {
    renderWithProviders(<GiteaLoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    await userEvent.type(screen.getByTestId('login-hostname'), 'gitea.example.com');

    await userEvent.click(screen.getByTestId('login-create-token'));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://gitea.example.com/user/settings/applications',
    );
  });

  it('should login using a token - success', async () => {
    loginWithPersonalAccessTokenMock.mockResolvedValueOnce(null);

    renderWithProviders(<GiteaLoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    await userEvent.type(screen.getByTestId('login-hostname'), 'gitea.example.com');

    await userEvent.type(
      screen.getByTestId('login-token'),
      'abcdef1234567890abcdef1234567890abcdef12',
    );

    await userEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(loginWithPersonalAccessTokenMock).toHaveBeenCalledTimes(1);
      expect(loginWithPersonalAccessTokenMock).toHaveBeenCalledWith({
        hostname: 'gitea.example.com',
        token: 'abcdef1234567890abcdef1234567890abcdef12',
        forge: 'gitea',
      });
      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  it('should login using a token - failure', async () => {
    loginWithPersonalAccessTokenMock.mockRejectedValueOnce(new Error('invalid token'));

    renderWithProviders(<GiteaLoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    await userEvent.type(screen.getByTestId('login-hostname'), 'gitea.example.com');
    await userEvent.type(
      screen.getByTestId('login-token'),
      'abcdef1234567890abcdef1234567890abcdef12',
    );
    await userEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('login-errors')).toHaveTextContent(
        'Failed to validate provided token against gitea.example.com',
      );
      expect(navigateMock).not.toHaveBeenCalled();
    });
  });

  it('should open help docs in the browser', async () => {
    renderWithProviders(<GiteaLoginWithPersonalAccessTokenRoute />);

    await userEvent.click(screen.getByTestId('login-docs'));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://docs.gitea.com/development/api-usage',
    );
  });

  it('should prefill hostname from the re-auth account in location state', () => {
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

    expect(screen.getByTestId('login-hostname')).toHaveValue('codeberg.org');
  });
});
