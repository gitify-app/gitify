import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../__helpers__/test-utils';

import * as comms from '../utils/system/comms';
import { LoginWithDeviceFlowRoute } from './LoginWithDeviceFlow';

describe('renderer/routes/LoginWithDeviceFlow.tsx', () => {
  const copyToClipboardSpy = vi
    .spyOn(comms, 'copyToClipboard')
    .mockResolvedValue();
  const openExternalLinkSpy = vi
    .spyOn(comms, 'openExternalLink')
    .mockImplementation(vi.fn());

  it('should render scope choice buttons', async () => {
    const loginWithDeviceFlowStartMock = vi.fn().mockResolvedValueOnce({
      hostname: 'github.com',
      clientId: 'test-id',
      deviceCode: 'device-code',
      userCode: 'USER-1234',
      verificationUri: 'https://github.com/login/device',
      intervalSeconds: 5,
      expiresAt: Date.now() + 900000,
    });

    renderWithProviders(<LoginWithDeviceFlowRoute />, {
      loginWithDeviceFlowStart: loginWithDeviceFlowStartMock,
    });

    expect(screen.getByText('Receive notifications for:')).toBeInTheDocument();
    expect(screen.getByTestId('device-scope-public')).toBeInTheDocument();
    expect(screen.getByTestId('device-scope-full')).toBeInTheDocument();

    // Device flow should not start until user makes a choice
    expect(loginWithDeviceFlowStartMock).not.toHaveBeenCalled();
  });

  it('should start device flow with public scope when clicking Public', async () => {
    const loginWithDeviceFlowStartMock = vi.fn().mockResolvedValueOnce({
      hostname: 'github.com',
      clientId: 'test-id',
      deviceCode: 'device-code',
      userCode: 'USER-1234',
      verificationUri: 'https://github.com/login/device',
      intervalSeconds: 5,
      expiresAt: Date.now() + 900000,
    });

    renderWithProviders(<LoginWithDeviceFlowRoute />, {
      loginWithDeviceFlowStart: loginWithDeviceFlowStartMock,
    });

    await userEvent.click(screen.getByTestId('device-scope-public'));

    expect(loginWithDeviceFlowStartMock).toHaveBeenCalledWith(undefined, [
      'notifications',
      'read:user',
      'public_repo',
    ]);

    await screen.findByTestId('device-user-code');
    expect(screen.getByTestId('device-verification-link')).toBeInTheDocument();

    // Verify auto-copy and auto-open were called
    expect(copyToClipboardSpy).toHaveBeenCalledWith('USER-1234');
    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://github.com/login/device',
    );
  });

  it('should start device flow with full scope when clicking Public and Private', async () => {
    const loginWithDeviceFlowStartMock = vi.fn().mockResolvedValueOnce({
      hostname: 'github.com',
      clientId: 'test-id',
      deviceCode: 'device-code',
      userCode: 'USER-1234',
      verificationUri: 'https://github.com/login/device',
      intervalSeconds: 5,
      expiresAt: Date.now() + 900000,
    });

    renderWithProviders(<LoginWithDeviceFlowRoute />, {
      loginWithDeviceFlowStart: loginWithDeviceFlowStartMock,
    });

    await userEvent.click(screen.getByTestId('device-scope-full'));

    expect(loginWithDeviceFlowStartMock).toHaveBeenCalledWith(undefined, [
      'notifications',
      'read:user',
      'repo',
    ]);

    await screen.findByTestId('device-user-code');
  });

  it('should copy user code to clipboard when clicking copy button', async () => {
    const loginWithDeviceFlowStartMock = vi.fn().mockResolvedValueOnce({
      hostname: 'github.com',
      clientId: 'test-id',
      deviceCode: 'device-code',
      userCode: 'USER-1234',
      verificationUri: 'https://github.com/login/device',
      intervalSeconds: 5,
      expiresAt: Date.now() + 900000,
    });

    renderWithProviders(<LoginWithDeviceFlowRoute />, {
      loginWithDeviceFlowStart: loginWithDeviceFlowStartMock,
    });

    await userEvent.click(screen.getByTestId('device-scope-public'));
    await screen.findByTestId('device-user-code');

    // Clear the auto-copy call from initialization
    copyToClipboardSpy.mockClear();

    await userEvent.click(screen.getByTestId('copy-device-code'));

    expect(copyToClipboardSpy).toHaveBeenCalledWith('USER-1234');
  });

  it('should handle device flow errors during initialization', async () => {
    const loginWithDeviceFlowStartMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(<LoginWithDeviceFlowRoute />, {
      loginWithDeviceFlowStart: loginWithDeviceFlowStartMock,
    });

    await userEvent.click(screen.getByTestId('device-scope-full'));

    await screen.findByText(/Failed to start authentication/);
  });

  it('should navigate back on cancel from scope choice', async () => {
    const loginWithDeviceFlowStartMock = vi.fn().mockResolvedValueOnce({
      hostname: 'github.com',
      clientId: 'test-id',
      deviceCode: 'device-code',
      userCode: 'USER-1234',
      verificationUri: 'https://github.com/login/device',
      intervalSeconds: 5,
      expiresAt: Date.now() + 900000,
    });

    renderWithProviders(<LoginWithDeviceFlowRoute />, {
      loginWithDeviceFlowStart: loginWithDeviceFlowStartMock,
    });

    await userEvent.click(screen.getByTestId('cancel-button'));

    expect(navigateMock).toHaveBeenCalledWith(-1);
  });
});
