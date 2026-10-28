import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../../__helpers__/test-utils';

import * as logger from '../../utils/core/logger';
import * as comms from '../../utils/system/comms';
import { GitHubLoginWithOAuthAppRoute } from './LoginWithOAuthApp';

describe('renderer/routes/github/LoginWithOAuthApp.tsx', () => {
  const loginWithOAuthAppMock = vi.fn();

  const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());

  it('renders the OAuth app form', () => {
    renderWithProviders(<GitHubLoginWithOAuthAppRoute />);

    expect(screen.getByRole('heading', { name: 'Login with OAuth App' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /^Hostname/ })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /^Client ID/ })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Client Secret/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create new OAuth App' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('let us go back', async () => {
    renderWithProviders(<GitHubLoginWithOAuthAppRoute />);

    await userEvent.click(screen.getByRole('button', { name: 'Go back' }));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  describe("'Create new OAuth App' button", () => {
    it('is disabled if no hostname configured', async () => {
      renderWithProviders(<GitHubLoginWithOAuthAppRoute />);

      await userEvent.clear(screen.getByRole('textbox', { name: /^Hostname/ }));

      await userEvent.click(screen.getByRole('button', { name: 'Create new OAuth App' }));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(0);
    });

    it('opens in browser if hostname configured', async () => {
      renderWithProviders(<GitHubLoginWithOAuthAppRoute />);

      const hostname = screen.getByRole('textbox', { name: /^Hostname/ });
      await userEvent.clear(hostname);
      await userEvent.type(hostname, 'company.github.com');

      await userEvent.click(screen.getByRole('button', { name: 'Create new OAuth App' }));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('logs in using a token - success', async () => {
    loginWithOAuthAppMock.mockResolvedValueOnce(null);

    renderWithProviders(<GitHubLoginWithOAuthAppRoute />, {
      loginWithOAuthApp: loginWithOAuthAppMock,
    });

    const hostname = screen.getByRole('textbox', { name: /^Hostname/ });
    await userEvent.clear(hostname);
    await userEvent.type(hostname, 'github.com');

    await userEvent.type(
      screen.getByRole('textbox', { name: /^Client ID/ }),
      '1234567890_ASDFGHJKL',
    );

    await userEvent.type(
      screen.getByLabelText(/^Client Secret/),
      '1234567890_asdfghjklPOIUYTREWQ0987654321',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(loginWithOAuthAppMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/');
  });

  it('logs in using a token - failure', async () => {
    const rendererLogErrorSpy = vi.spyOn(logger, 'rendererLogError').mockImplementation(vi.fn());
    loginWithOAuthAppMock.mockRejectedValueOnce(null);

    renderWithProviders(<GitHubLoginWithOAuthAppRoute />, {
      loginWithOAuthApp: loginWithOAuthAppMock,
    });

    const hostname = screen.getByRole('textbox', { name: /^Hostname/ });
    await userEvent.clear(hostname);
    await userEvent.type(hostname, 'github.com');

    await userEvent.type(
      screen.getByRole('textbox', { name: /^Client ID/ }),
      '1234567890_ASDFGHJKL',
    );

    await userEvent.type(
      screen.getByLabelText(/^Client Secret/),
      '1234567890_asdfghjklPOIUYTREWQ0987654321',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(loginWithOAuthAppMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledTimes(0);
      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('renders the form with errors', async () => {
    renderWithProviders(<GitHubLoginWithOAuthAppRoute />);

    const hostname = screen.getByRole('textbox', { name: /^Hostname/ });
    await userEvent.clear(hostname);
    await userEvent.type(hostname, 'test');

    await userEvent.type(screen.getByRole('textbox', { name: /^Client ID/ }), '123');

    await userEvent.type(screen.getByLabelText(/^Client Secret/), 'abc');

    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(screen.getByText('Hostname format is invalid')).toBeInTheDocument();
    expect(screen.getByText('Client ID format is invalid')).toBeInTheDocument();
    expect(screen.getByText('Client Secret format is invalid')).toBeInTheDocument();
  });

  it('opens help docs in the browser', async () => {
    renderWithProviders(<GitHubLoginWithOAuthAppRoute />);

    await userEvent.click(screen.getByRole('button', { name: 'Docs' }));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
  });

  it('toggles client secret visibility', async () => {
    renderWithProviders(<GitHubLoginWithOAuthAppRoute />);

    const secretInput = screen.getByLabelText(/^Client Secret/);
    expect(secretInput).toHaveAttribute('type', 'password');

    await userEvent.click(screen.getByLabelText('Show token'));
    expect(secretInput).toHaveAttribute('type', 'text');

    await userEvent.click(screen.getByLabelText('Hide token'));
    expect(secretInput).toHaveAttribute('type', 'password');
  });
});
