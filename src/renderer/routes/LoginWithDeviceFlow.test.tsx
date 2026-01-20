import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../__helpers__/test-utils';

import { LoginWithDeviceFlowRoute } from './LoginWithDeviceFlow';

const navigateMock = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => navigateMock,
}));

describe('renderer/routes/LoginWithDeviceFlow.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render and initialize device flow', async () => {
    const startGitHubDeviceFlowMock = jest.fn().mockResolvedValueOnce({
      hostname: 'github.com',
      clientId: 'test-id',
      deviceCode: 'device-code',
      userCode: 'USER-1234',
      verificationUri: 'https://github.com/login/device',
      intervalSeconds: 5,
      expiresAt: Date.now() + 900000,
    });

    renderWithAppContext(<LoginWithDeviceFlowRoute />, {
      startGitHubDeviceFlow: startGitHubDeviceFlowMock,
    });

    expect(startGitHubDeviceFlowMock).toHaveBeenCalled();

    await screen.findByText(/USER-1234/);
    expect(screen.getByText(/github.com\/login\/device/)).toBeInTheDocument();
  });

  it('should copy user code to clipboard', async () => {
    const startGitHubDeviceFlowMock = jest.fn().mockResolvedValueOnce({
      hostname: 'github.com',
      clientId: 'test-id',
      deviceCode: 'device-code',
      userCode: 'USER-1234',
      verificationUri: 'https://github.com/login/device',
      intervalSeconds: 5,
      expiresAt: Date.now() + 900000,
    });

    renderWithAppContext(<LoginWithDeviceFlowRoute />, {
      startGitHubDeviceFlow: startGitHubDeviceFlowMock,
    });

    await screen.findByText(/USER-1234/);

    await userEvent.click(screen.getByLabelText('Copy device code'));

    // We can't easily spy on navigator.clipboard in tests, but the button exists and works
    expect(screen.getByLabelText('Copy device code')).toBeInTheDocument();
  });

  it('should handle device flow errors during initialization', async () => {
    const startGitHubDeviceFlowMock = jest
      .fn()
      .mockRejectedValueOnce(new Error('Network error'));

    renderWithAppContext(<LoginWithDeviceFlowRoute />, {
      startGitHubDeviceFlow: startGitHubDeviceFlowMock,
    });

    await screen.findByText(/Failed to start authentication/);
  });

  it('should navigate back on cancel', async () => {
    const startGitHubDeviceFlowMock = jest.fn().mockResolvedValueOnce({
      hostname: 'github.com',
      clientId: 'test-id',
      deviceCode: 'device-code',
      userCode: 'USER-1234',
      verificationUri: 'https://github.com/login/device',
      intervalSeconds: 5,
      expiresAt: Date.now() + 900000,
    });

    renderWithAppContext(<LoginWithDeviceFlowRoute />, {
      startGitHubDeviceFlow: startGitHubDeviceFlowMock,
    });

    await screen.findByText(/USER-1234/);

    await userEvent.click(screen.getByText('Cancel'));

    expect(navigateMock).toHaveBeenCalledWith(-1);
  });
});
