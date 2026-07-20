import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../../__helpers__/test-utils';
import { mockBitbucketAccount } from '../../__mocks__/account-mocks';

import {
  type IFormData,
  validateForm,
} from '../../components/login/LoginWithPersonalAccessTokenForm';

import type { Hostname, Token } from '../../types';

import * as comms from '../../utils/system/comms';
import { BitbucketLoginWithPersonalAccessTokenRoute } from './LoginWithPersonalAccessToken';

describe('renderer/routes/bitbucket/LoginWithPersonalAccessToken.tsx', () => {
  const loginWithPersonalAccessTokenMock = vi.fn();
  const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());

  it('renders correctly', () => {
    const tree = renderWithProviders(<BitbucketLoginWithPersonalAccessTokenRoute />);

    expect(tree.container).toMatchSnapshot();
  });

  describe('form validation', () => {
    it('requires username (Atlassian email) for bitbucket', () => {
      const values: IFormData = {
        hostname: 'bitbucket.org' as Hostname,
        token: 'my-api-token' as Token,
        username: '',
      };

      expect(validateForm(values, 'bitbucket').username).toBe('Atlassian email is required');
    });

    it('passes validation with username and token', () => {
      const values: IFormData = {
        hostname: 'bitbucket.org' as Hostname,
        token: 'my-api-token' as Token,
        username: 'user@example.com',
      };

      expect(validateForm(values, 'bitbucket')).toEqual({});
    });
  });

  it('renders the username field', () => {
    renderWithProviders(<BitbucketLoginWithPersonalAccessTokenRoute />);
    expect(screen.getByTestId('login-username')).toBeInTheDocument();
  });

  it('should open the token settings page', async () => {
    renderWithProviders(<BitbucketLoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    await userEvent.click(screen.getByTestId('login-create-token'));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://id.atlassian.com/manage-profile/security/api-tokens',
    );
  });

  it('should login successfully with username and token', async () => {
    loginWithPersonalAccessTokenMock.mockResolvedValueOnce(null);

    renderWithProviders(<BitbucketLoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    await userEvent.type(screen.getByTestId('login-username'), 'user@example.com');
    await userEvent.type(screen.getByTestId('login-token'), 'my-api-token');

    await userEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(loginWithPersonalAccessTokenMock).toHaveBeenCalledTimes(1);
      expect(loginWithPersonalAccessTokenMock).toHaveBeenCalledWith({
        hostname: 'bitbucket.org',
        token: 'my-api-token',
        username: 'user@example.com',
        forge: 'bitbucket',
      });
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  it('shows an error banner on login failure', async () => {
    loginWithPersonalAccessTokenMock.mockRejectedValueOnce(new Error('invalid credentials'));

    renderWithProviders(<BitbucketLoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    await userEvent.type(screen.getByTestId('login-username'), 'user@example.com');
    await userEvent.type(screen.getByTestId('login-token'), 'my-api-token');
    await userEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('login-errors')).toHaveTextContent(
        'Failed to validate provided token against bitbucket.org',
      );
      expect(navigateMock).not.toHaveBeenCalled();
    });
  });

  it('should open help docs in the browser', async () => {
    renderWithProviders(<BitbucketLoginWithPersonalAccessTokenRoute />);

    await userEvent.click(screen.getByTestId('login-docs'));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/',
    );
  });

  it('prefills username and hostname from the re-auth account in location state', () => {
    renderWithProviders(<BitbucketLoginWithPersonalAccessTokenRoute />, {
      initialEntries: [
        {
          pathname: '/login/bitbucket/personal-access-token',
          state: {
            account: mockBitbucketAccount,
          },
        },
      ],
    });

    expect(screen.getByTestId('login-username')).toHaveValue('user@example.com');
    expect(screen.getByTestId('login-hostname')).toHaveValue('bitbucket.org');
  });
});
