import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../../__helpers__/test-utils';
import { mockGitHubAppAccount } from '../../__mocks__/account-mocks';

import type { Hostname } from '../../types';

import * as logger from '../../utils/core/logger';
import * as comms from '../../utils/system/comms';
import { GitHubLoginWithDeviceFlowRoute } from './LoginWithDeviceFlow';

describe('renderer/routes/github/LoginWithDeviceFlow.tsx', () => {
  const copyToClipboardSpy = vi.spyOn(comms, 'copyToClipboard').mockResolvedValue();
  const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());

  it('renders scope choice buttons', async () => {
    const loginWithDeviceFlowStartMock = vi.fn().mockResolvedValueOnce({
      hostname: 'github.com',
      clientId: 'test-id',
      deviceCode: 'device-code',
      userCode: 'USER-1234',
      verificationUri: 'https://github.com/login/device',
      intervalSeconds: 5,
      expiresAt: Date.now() + 900000,
    });

    renderWithProviders(<GitHubLoginWithDeviceFlowRoute />, {
      loginWithDeviceFlowStart: loginWithDeviceFlowStartMock,
    });

    expect(screen.getByText('Receive notifications for:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Public Limited/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Public and Private/ })).toBeInTheDocument();

    // Device flow should not start until user makes a choice
    expect(loginWithDeviceFlowStartMock).not.toHaveBeenCalled();
  });

  it('starts device flow with public scope when clicking Public', async () => {
    const loginWithDeviceFlowStartMock = vi.fn().mockResolvedValueOnce({
      hostname: 'github.com',
      clientId: 'test-id',
      deviceCode: 'device-code',
      userCode: 'USER-1234',
      verificationUri: 'https://github.com/login/device',
      intervalSeconds: 5,
      expiresAt: Date.now() + 900000,
    });

    renderWithProviders(<GitHubLoginWithDeviceFlowRoute />, {
      loginWithDeviceFlowStart: loginWithDeviceFlowStartMock,
    });

    await userEvent.click(screen.getByRole('button', { name: /^Public Limited/ }));

    expect(loginWithDeviceFlowStartMock).toHaveBeenCalledWith('github', undefined, [
      'notifications',
      'read:user',
      'public_repo',
    ]);

    await screen.findByTestId('device-user-code');
    expect(screen.getByRole('button', { name: /^Open / })).toBeInTheDocument();

    // Verify auto-copy and auto-open were called
    expect(copyToClipboardSpy).toHaveBeenCalledWith('USER-1234');
    expect(openExternalLinkSpy).toHaveBeenCalledWith('https://github.com/login/device');
  });

  it('starts device flow with full scope when clicking Public and Private', async () => {
    const loginWithDeviceFlowStartMock = vi.fn().mockResolvedValueOnce({
      hostname: 'github.com',
      clientId: 'test-id',
      deviceCode: 'device-code',
      userCode: 'USER-1234',
      verificationUri: 'https://github.com/login/device',
      intervalSeconds: 5,
      expiresAt: Date.now() + 900000,
    });

    renderWithProviders(<GitHubLoginWithDeviceFlowRoute />, {
      loginWithDeviceFlowStart: loginWithDeviceFlowStartMock,
    });

    await userEvent.click(screen.getByRole('button', { name: /Public and Private/ }));

    expect(loginWithDeviceFlowStartMock).toHaveBeenCalledWith('github', undefined, [
      'notifications',
      'read:user',
      'repo',
    ]);

    await screen.findByTestId('device-user-code');
  });

  it('shows status indicators after device flow starts', async () => {
    const loginWithDeviceFlowStartMock = vi.fn().mockResolvedValueOnce({
      hostname: 'github.com',
      clientId: 'test-id',
      deviceCode: 'device-code',
      userCode: 'USER-1234',
      verificationUri: 'https://github.com/login/device',
      intervalSeconds: 5,
      expiresAt: Date.now() + 900000,
    });

    renderWithProviders(<GitHubLoginWithDeviceFlowRoute />, {
      loginWithDeviceFlowStart: loginWithDeviceFlowStartMock,
    });

    await userEvent.click(screen.getByRole('button', { name: /^Public Limited/ }));
    await screen.findByTestId('device-user-code');

    expect(screen.getByText('Code copied to clipboard')).toBeInTheDocument();
    expect(screen.getByText('Opened GitHub.com')).toBeInTheDocument();
    expect(screen.getByText('Waiting for authorization...')).toBeInTheDocument();
  });

  it('opens browser and copy link via footer buttons', async () => {
    const loginWithDeviceFlowStartMock = vi.fn().mockResolvedValueOnce({
      hostname: 'github.com',
      clientId: 'test-id',
      deviceCode: 'device-code',
      userCode: 'USER-1234',
      verificationUri: 'https://github.com/login/device',
      intervalSeconds: 5,
      expiresAt: Date.now() + 900000,
    });

    renderWithProviders(<GitHubLoginWithDeviceFlowRoute />, {
      loginWithDeviceFlowStart: loginWithDeviceFlowStartMock,
    });

    await userEvent.click(screen.getByRole('button', { name: /^Public Limited/ }));
    await screen.findByTestId('device-user-code');

    // Reset spies to isolate button interactions
    openExternalLinkSpy.mockClear();
    copyToClipboardSpy.mockClear();

    await userEvent.click(screen.getByRole('button', { name: /^Open / }));
    expect(openExternalLinkSpy).toHaveBeenCalledWith('https://github.com/login/device');

    await userEvent.click(screen.getByRole('button', { name: 'Copy link' }));
    expect(copyToClipboardSpy).toHaveBeenCalledWith('https://github.com/login/device');
  });

  it('copies user code to clipboard when clicking copy button', async () => {
    const loginWithDeviceFlowStartMock = vi.fn().mockResolvedValueOnce({
      hostname: 'github.com',
      clientId: 'test-id',
      deviceCode: 'device-code',
      userCode: 'USER-1234',
      verificationUri: 'https://github.com/login/device',
      intervalSeconds: 5,
      expiresAt: Date.now() + 900000,
    });

    renderWithProviders(<GitHubLoginWithDeviceFlowRoute />, {
      loginWithDeviceFlowStart: loginWithDeviceFlowStartMock,
    });

    await userEvent.click(screen.getByRole('button', { name: /^Public Limited/ }));
    await screen.findByTestId('device-user-code');

    // Clear the auto-copy call from initialization
    copyToClipboardSpy.mockClear();

    await userEvent.click(screen.getByRole('button', { name: 'Copy device code' }));

    expect(copyToClipboardSpy).toHaveBeenCalledWith('USER-1234');
  });

  it('handles device flow errors during initialization', async () => {
    const rendererLogErrorSpy = vi.spyOn(logger, 'rendererLogError').mockImplementation(vi.fn());
    const loginWithDeviceFlowStartMock = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(<GitHubLoginWithDeviceFlowRoute />, {
      loginWithDeviceFlowStart: loginWithDeviceFlowStartMock,
    });

    await userEvent.click(screen.getByRole('button', { name: /Public and Private/ }));

    await screen.findByText(/Failed to start authentication/);
    expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
  });

  it('navigates back on cancel from scope choice', async () => {
    const loginWithDeviceFlowStartMock = vi.fn().mockResolvedValueOnce({
      hostname: 'github.com',
      clientId: 'test-id',
      deviceCode: 'device-code',
      userCode: 'USER-1234',
      verificationUri: 'https://github.com/login/device',
      intervalSeconds: 5,
      expiresAt: Date.now() + 900000,
    });

    renderWithProviders(<GitHubLoginWithDeviceFlowRoute />, {
      loginWithDeviceFlowStart: loginWithDeviceFlowStartMock,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it('completes login when poll returns a token', async () => {
    const loginWithDeviceFlowStartMock = vi.fn().mockResolvedValueOnce({
      hostname: 'github.com',
      clientId: 'test-id',
      deviceCode: 'device-code',
      userCode: 'USER-1234',
      verificationUri: 'https://github.com/login/device',
      intervalSeconds: 5,
      expiresAt: Date.now() + 900000,
    });
    const loginWithDeviceFlowPollMock = vi.fn().mockResolvedValueOnce('access-token');
    const loginWithDeviceFlowCompleteMock = vi.fn().mockResolvedValueOnce(undefined);

    renderWithProviders(<GitHubLoginWithDeviceFlowRoute />, {
      loginWithDeviceFlowStart: loginWithDeviceFlowStartMock,
      loginWithDeviceFlowPoll: loginWithDeviceFlowPollMock,
      loginWithDeviceFlowComplete: loginWithDeviceFlowCompleteMock,
    });

    await userEvent.click(screen.getByRole('button', { name: /^Public Limited/ }));
    await screen.findByTestId('device-user-code');

    await waitFor(() => {
      expect(loginWithDeviceFlowPollMock).toHaveBeenCalledTimes(1);
      expect(loginWithDeviceFlowCompleteMock).toHaveBeenCalledWith(
        'github',
        'access-token',
        'github.com',
      );
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  it('shows an error when device flow poll fails', async () => {
    const rendererLogErrorSpy = vi.spyOn(logger, 'rendererLogError').mockImplementation(vi.fn());
    const loginWithDeviceFlowStartMock = vi.fn().mockResolvedValueOnce({
      hostname: 'github.com',
      clientId: 'test-id',
      deviceCode: 'device-code',
      userCode: 'USER-1234',
      verificationUri: 'https://github.com/login/device',
      intervalSeconds: 5,
      expiresAt: Date.now() + 900000,
    });
    const loginWithDeviceFlowPollMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('authorization denied'));

    renderWithProviders(<GitHubLoginWithDeviceFlowRoute />, {
      loginWithDeviceFlowStart: loginWithDeviceFlowStartMock,
      loginWithDeviceFlowPoll: loginWithDeviceFlowPollMock,
    });

    await userEvent.click(screen.getByRole('button', { name: /^Public Limited/ }));
    await screen.findByTestId('device-user-code');

    await waitFor(() => {
      expect(screen.getByText('Authentication failed. Please try again.')).toBeInTheDocument();
      expect(rendererLogErrorSpy).toHaveBeenCalled();
    });
  });

  it('shows an error when the device code expires before authorization', async () => {
    const loginWithDeviceFlowStartMock = vi.fn().mockResolvedValueOnce({
      hostname: 'github.com',
      clientId: 'test-id',
      deviceCode: 'device-code',
      userCode: 'USER-1234',
      verificationUri: 'https://github.com/login/device',
      intervalSeconds: 5,
      // Already expired so the poll loop exits immediately.
      expiresAt: Date.now() - 1000,
    });
    const loginWithDeviceFlowPollMock = vi.fn();

    renderWithProviders(<GitHubLoginWithDeviceFlowRoute />, {
      loginWithDeviceFlowStart: loginWithDeviceFlowStartMock,
      loginWithDeviceFlowPoll: loginWithDeviceFlowPollMock,
    });

    await userEvent.click(screen.getByRole('button', { name: /^Public Limited/ }));
    await screen.findByTestId('device-user-code');

    await waitFor(() => {
      expect(screen.getByText('Device code expired. Please start again.')).toBeInTheDocument();
      expect(loginWithDeviceFlowPollMock).not.toHaveBeenCalled();
    });
  });

  it('passes the re-auth account hostname into device flow start', async () => {
    const loginWithDeviceFlowStartMock = vi.fn().mockResolvedValueOnce({
      hostname: 'github.enterprise.example',
      clientId: 'test-id',
      deviceCode: 'device-code',
      userCode: 'USER-1234',
      verificationUri: 'https://github.enterprise.example/login/device',
      intervalSeconds: 5,
      expiresAt: Date.now() + 900000,
    });

    renderWithProviders(<GitHubLoginWithDeviceFlowRoute />, {
      loginWithDeviceFlowStart: loginWithDeviceFlowStartMock,
      loginWithDeviceFlowPoll: vi.fn().mockResolvedValueOnce(null),
      initialEntries: [
        {
          pathname: '/login/github/device-flow',
          state: {
            account: {
              ...mockGitHubAppAccount,
              hostname: 'github.enterprise.example' as Hostname,
            },
          },
        },
      ],
    });

    await userEvent.click(screen.getByRole('button', { name: /Public and Private/ }));

    expect(loginWithDeviceFlowStartMock).toHaveBeenCalledWith(
      'github',
      'github.enterprise.example',
      ['notifications', 'read:user', 'repo'],
    );
  });

  it('opens the revoke-access developer settings link', async () => {
    renderWithProviders(<GitHubLoginWithDeviceFlowRoute />);

    await userEvent.click(screen.getByTitle('GitHub → Developer Settings'));

    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      expect.stringContaining('/settings/connections/applications/'),
    );
  });
});
