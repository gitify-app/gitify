import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../../__helpers__/test-utils';
import { mockGitHubEnterpriseServerAccount } from '../../__mocks__/account-mocks';

import * as logger from '../../utils/core/logger';
import { GitHubLoginWithCLIRoute } from './LoginWithGitHubCLI';

describe('renderer/routes/github/LoginWithGitHubCLI.tsx', () => {
  const loginWithCliMock = vi.fn();

  it('renders correctly', () => {
    const tree = renderWithProviders(<GitHubLoginWithCLIRoute />);

    expect(tree.container).toMatchSnapshot();
  });

  it('logs in against github.com without asking for a token', async () => {
    loginWithCliMock.mockResolvedValueOnce(undefined);

    renderWithProviders(<GitHubLoginWithCLIRoute />, { loginWithCli: loginWithCliMock });

    expect(screen.queryByTestId('login-token')).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(loginWithCliMock).toHaveBeenCalledWith('github', 'github.com');
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  it('logs in against the hostname entered', async () => {
    loginWithCliMock.mockResolvedValueOnce(undefined);

    renderWithProviders(<GitHubLoginWithCLIRoute />, { loginWithCli: loginWithCliMock });

    const hostname = screen.getByTestId('login-hostname');
    await userEvent.clear(hostname);
    await userEvent.type(hostname, 'github.gitify.io');
    await userEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() =>
      expect(loginWithCliMock).toHaveBeenCalledWith('github', 'github.gitify.io'),
    );
  });

  it('prefills the hostname of the account being re-authenticated', () => {
    renderWithProviders(<GitHubLoginWithCLIRoute />, {
      initialEntries: [
        {
          pathname: '/login/github/cli',
          state: { account: mockGitHubEnterpriseServerAccount },
        },
      ],
    });

    expect(screen.getByTestId('login-hostname')).toHaveValue(
      mockGitHubEnterpriseServerAccount.hostname,
    );
  });

  it('rejects a malformed hostname before reaching the CLI', async () => {
    renderWithProviders(<GitHubLoginWithCLIRoute />, { loginWithCli: loginWithCliMock });

    const hostname = screen.getByTestId('login-hostname');
    await userEvent.clear(hostname);
    await userEvent.type(hostname, 'hello');
    await userEvent.click(screen.getByTestId('login-submit'));

    expect(screen.getByTestId('login-errors')).toHaveTextContent('Hostname format is invalid');
    expect(loginWithCliMock).not.toHaveBeenCalled();
  });

  it('surfaces what the CLI said when login fails', async () => {
    vi.spyOn(logger, 'rendererLogError').mockImplementation(vi.fn());
    loginWithCliMock.mockRejectedValueOnce(
      new Error('GitHub CLI has no token for github.com. Run `gh auth login` and try again.'),
    );

    renderWithProviders(<GitHubLoginWithCLIRoute />, { loginWithCli: loginWithCliMock });

    await userEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() =>
      expect(screen.getByTestId('login-errors')).toHaveTextContent(
        'GitHub CLI has no token for github.com.',
      ),
    );
    expect(navigateMock).not.toHaveBeenCalledWith('/');
  });
});
