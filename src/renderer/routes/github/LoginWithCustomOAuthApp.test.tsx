import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';
import { mockCustomOAuthAppAccount } from '../../__mocks__/account-mocks';

import * as comms from '../../utils/system/comms';
import { GitHubLoginWithCustomOAuthAppRoute } from './LoginWithCustomOAuthApp';

describe('renderer/routes/github/LoginWithCustomOAuthApp.tsx', () => {
  const copyToClipboardSpy = vi.spyOn(comms, 'copyToClipboard').mockResolvedValue();
  const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());

  const session = {
    hostname: 'github.example.com',
    clientId: 'CUSTOM_CLIENT_ID_123',
    deviceCode: 'device-code',
    userCode: 'USER-1234',
    verificationUri: 'https://github.example.com/login/device',
    intervalSeconds: 5,
    expiresAt: Date.now() + 900000,
  };

  it('collects a hostname and client ID, and no client secret', () => {
    renderWithProviders(<GitHubLoginWithCustomOAuthAppRoute />);

    expect(screen.getByTestId('login-hostname')).toBeInTheDocument();
    expect(screen.getByTestId('login-clientId')).toBeInTheDocument();
    expect(screen.queryByTestId('login-clientSecret')).not.toBeInTheDocument();
  });

  it('shows validation errors for an invalid hostname and client ID', async () => {
    renderWithProviders(<GitHubLoginWithCustomOAuthAppRoute />);

    const hostname = screen.getByTestId('login-hostname');
    await userEvent.clear(hostname);
    await userEvent.type(hostname, 'test');
    await userEvent.type(screen.getByTestId('login-clientId'), 'short');

    await userEvent.click(screen.getByTestId('login-submit'));

    expect(screen.getByText('Hostname format is invalid')).toBeInTheDocument();
    expect(screen.getByText('Client ID format is invalid')).toBeInTheDocument();
    // Still on the credentials step — the device flow was not started.
    expect(screen.getByTestId('login-submit')).toBeInTheDocument();
  });

  it('reuses the scope step and starts the device flow with the supplied credentials', async () => {
    const loginWithDeviceFlowStartMock = vi.fn().mockResolvedValueOnce(session);

    renderWithProviders(<GitHubLoginWithCustomOAuthAppRoute />, {
      loginWithDeviceFlowStart: loginWithDeviceFlowStartMock,
      loginWithDeviceFlowPoll: vi.fn().mockResolvedValue(null),
    });

    const hostname = screen.getByTestId('login-hostname');
    await userEvent.clear(hostname);
    await userEvent.type(hostname, 'github.example.com');
    await userEvent.type(screen.getByTestId('login-clientId'), 'CUSTOM_CLIENT_ID_123');

    await userEvent.click(screen.getByTestId('login-submit'));

    // The shared public/recommended scope step is shown before the session starts.
    expect(screen.getByTestId('device-scope-full')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('device-scope-full'));

    await waitFor(() => {
      expect(loginWithDeviceFlowStartMock).toHaveBeenCalledWith(
        'github',
        'github.example.com',
        ['notifications', 'read:user', 'repo'],
        'CUSTOM_CLIENT_ID_123',
      );
    });

    await screen.findByTestId('device-user-code');
    expect(copyToClipboardSpy).toHaveBeenCalledWith('USER-1234');
  });

  it('opens the OAuth app registration page with an inert callback URL', async () => {
    renderWithProviders(<GitHubLoginWithCustomOAuthAppRoute />);

    await userEvent.click(screen.getByTestId('login-create-oauth-app'));

    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      expect.stringContaining('https://github.com/settings/applications/new'),
    );
    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      expect.stringContaining('oauth_application%5Bcallback_url%5D=https%3A%2F%2Fgitify.io'),
    );
  });

  it('prefills the hostname and client ID from the re-auth account', () => {
    renderWithProviders(<GitHubLoginWithCustomOAuthAppRoute />, {
      initialEntries: [
        {
          pathname: '/login/github/custom-oauth-app',
          state: { account: mockCustomOAuthAppAccount },
        },
      ],
    });

    expect(screen.getByTestId('login-hostname')).toHaveValue('github.gitify.io');
    expect(screen.getByTestId('login-clientId')).toHaveValue('CUSTOM_CLIENT_ID_123');
  });
});
