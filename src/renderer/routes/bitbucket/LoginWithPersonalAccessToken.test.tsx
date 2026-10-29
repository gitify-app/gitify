import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../../__helpers__/test-utils';
import { mockBitbucketAccount } from '../../__mocks__/account-mocks';

import * as comms from '../../utils/system/comms';
import { BitbucketLoginWithPersonalAccessTokenRoute } from './LoginWithPersonalAccessToken';

describe('renderer/routes/bitbucket/LoginWithPersonalAccessToken.tsx', () => {
  const loginWithPersonalAccessTokenMock = vi.fn();
  const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());

  it('renders the personal access token form', () => {
    renderWithProviders(<BitbucketLoginWithPersonalAccessTokenRoute />);

    expect(
      screen.getByRole('heading', { name: 'Login to Bitbucket Cloud with API Token' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /^Atlassian Email/ })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Token/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open token settings' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /^Hostname/ })).not.toBeInTheDocument();
  });

  it('renders the username field', () => {
    renderWithProviders(<BitbucketLoginWithPersonalAccessTokenRoute />);
    expect(screen.getByRole('textbox', { name: /^Atlassian Email/ })).toBeInTheDocument();
  });

  it('opens the token settings page', async () => {
    renderWithProviders(<BitbucketLoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Open token settings' }));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://id.atlassian.com/manage-profile/security/api-tokens',
    );
  });

  it('logs in successfully with username and token', async () => {
    loginWithPersonalAccessTokenMock.mockResolvedValueOnce(null);

    renderWithProviders(<BitbucketLoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    await userEvent.type(
      screen.getByRole('textbox', { name: /^Atlassian Email/ }),
      'user@example.com',
    );
    await userEvent.type(screen.getByLabelText(/^Token/), 'my-api-token');

    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

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

    await userEvent.type(
      screen.getByRole('textbox', { name: /^Atlassian Email/ }),
      'user@example.com',
    );
    await userEvent.type(screen.getByLabelText(/^Token/), 'my-api-token');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByTestId('login-errors')).toHaveTextContent(
        'Failed to validate provided token against bitbucket.org',
      );
      expect(navigateMock).not.toHaveBeenCalled();
    });
  });

  it('opens help docs in the browser', async () => {
    renderWithProviders(<BitbucketLoginWithPersonalAccessTokenRoute />);

    await userEvent.click(screen.getByRole('button', { name: 'Docs' }));

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

    expect(screen.getByRole('textbox', { name: /^Atlassian Email/ })).toHaveValue(
      'user@example.com',
    );
    // hostname is always bitbucket.org and not shown as an editable field
    expect(screen.queryByRole('textbox', { name: /hostname/i })).not.toBeInTheDocument();
  });
});
