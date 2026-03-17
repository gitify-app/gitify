import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithAppContext } from '../__helpers__/test-utils';

import * as comms from '../utils/system/comms';
import { LoginWithDeviceFlowRoute } from './LoginWithDeviceFlow';

describe('renderer/routes/LoginWithDeviceFlow.tsx', () => {
  const copyToClipboardSpy = vi
    .spyOn(comms, 'copyToClipboard')
    .mockResolvedValue();
  const openExternalLinkSpy = vi
    .spyOn(comms, 'openExternalLink')
    .mockImplementation(vi.fn());

  beforeEach(() => {
    vi.clearAllMocks();
  });

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

    renderWithAppContext(<LoginWithDeviceFlowRoute />, {
      loginWithDeviceFlowStart: loginWithDeviceFlowStartMock,
    });

    expect(
      screen.getByText(
        'Choose which repositories you want to receive notifications for:',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Public Repositories')).toBeInTheDocument();
    expect(
      screen.getByText('Public and Private Repositories'),
    ).toBeInTheDocument();

    // Device flow should not start until user makes a choice
    expect(loginWithDeviceFlowStartMock).not.toHaveBeenCalled();
  });

  it('should start device flow with public scope when clicking Public Repositories', async () => {
    const loginWithDeviceFlowStartMock = vi.fn().mockResolvedValueOnce({
      hostname: 'github.com',
      clientId: 'test-id',
      deviceCode: 'device-code',
      userCode: 'USER-1234',
      verificationUri: 'https://github.com/login/device',
      intervalSeconds: 5,
      expiresAt: Date.now() + 900000,
    });

    renderWithAppContext(<LoginWithDeviceFlowRoute />, {
      loginWithDeviceFlowStart: loginWithDeviceFlowStartMock,
    });

    await userEvent.click(screen.getByText('Public Repositories'));

    expect(loginWithDeviceFlowStartMock).toHaveBeenCalledWith(undefined, [
      'notifications',
      'read:user',
      'public_repo',
    ]);

    await screen.findByText(/USER-1234/);
    expect(screen.getByText(/github.com\/login\/device/)).toBeInTheDocument();

    // Verify auto-copy and auto-open were called
    expect(copyToClipboardSpy).toHaveBeenCalledWith('USER-1234');
    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://github.com/login/device',
    );
  });

  it('should start device flow with full scope when clicking Public and Private Repositories', async () => {
    const loginWithDeviceFlowStartMock = vi.fn().mockResolvedValueOnce({
      hostname: 'github.com',
      clientId: 'test-id',
      deviceCode: 'device-code',
      userCode: 'USER-1234',
      verificationUri: 'https://github.com/login/device',
      intervalSeconds: 5,
      expiresAt: Date.now() + 900000,
    });

    renderWithAppContext(<LoginWithDeviceFlowRoute />, {
      loginWithDeviceFlowStart: loginWithDeviceFlowStartMock,
    });

    await userEvent.click(screen.getByText('Public and Private Repositories'));

    expect(loginWithDeviceFlowStartMock).toHaveBeenCalledWith(undefined, [
      'notifications',
      'read:user',
      'repo',
    ]);

    await screen.findByText(/USER-1234/);
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

    renderWithAppContext(<LoginWithDeviceFlowRoute />, {
      loginWithDeviceFlowStart: loginWithDeviceFlowStartMock,
    });

    await userEvent.click(screen.getByText('Public Repositories'));
    await screen.findByText(/USER-1234/);

    // Clear the auto-copy call from initialization
    copyToClipboardSpy.mockClear();

    await userEvent.click(screen.getByLabelText('Copy device code'));

    expect(copyToClipboardSpy).toHaveBeenCalledWith('USER-1234');
  });

  it('should handle device flow errors during initialization', async () => {
    const loginWithDeviceFlowStartMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network error'));

    renderWithAppContext(<LoginWithDeviceFlowRoute />, {
      loginWithDeviceFlowStart: loginWithDeviceFlowStartMock,
    });

    await userEvent.click(screen.getByText('Public and Private Repositories'));

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

    renderWithAppContext(<LoginWithDeviceFlowRoute />, {
      loginWithDeviceFlowStart: loginWithDeviceFlowStartMock,
    });

    await userEvent.click(screen.getByText('Cancel'));

    expect(navigateMock).toHaveBeenCalledWith(-1);
  });
});
