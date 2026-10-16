import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../__helpers__/test-utils';
import { mockGitHubCloudAccount } from '../__mocks__/account-mocks';

import * as comms from '../utils/system/comms';
import { LoginRoute } from './Login';

describe('renderer/routes/Login.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithProviders(<LoginRoute />);

    expect(tree.container).toMatchSnapshot();

    expect(navigateMock).toHaveBeenCalledTimes(0);
  });

  it('should redirect to notifications once logged in', () => {
    const showWindowSpy = vi.spyOn(comms, 'showWindow');

    renderWithProviders(<LoginRoute />, {
      accounts: [mockGitHubCloudAccount],
    });

    expect(showWindowSpy).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
  });

  it.each([
    ['login-github', '/login/github/device-flow'],
    ['login-pat', '/login/github/personal-access-token'],
    ['login-oauth-app', '/login/github/oauth-app'],
  ])('navigates %s', async (testId, route) => {
    renderWithProviders(<LoginRoute />);

    await userEvent.click(screen.getByTestId(testId));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith(route);
  });

  it('should navigate to login with Gitea personal access token', async () => {
    renderWithProviders(<LoginRoute />);

    await userEvent.click(screen.getByTestId('forge-tab-gitea'));
    await userEvent.click(screen.getByTestId('login-gitea-pat'));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/login/gitea/personal-access-token');
  });

  it('should switch the visible login methods when changing forges', async () => {
    renderWithProviders(<LoginRoute />);

    expect(screen.getByTestId('login-github')).toBeInTheDocument();
    expect(screen.queryByTestId('login-gitea-pat')).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId('forge-tab-gitea'));

    expect(screen.queryByTestId('login-github')).not.toBeInTheDocument();
    expect(screen.getByTestId('login-gitea-pat')).toBeInTheDocument();
  });
});
