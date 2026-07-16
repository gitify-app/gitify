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

  it('should login with github', async () => {
    renderWithProviders(<LoginRoute />);

    await userEvent.click(screen.getByTestId('login-github'));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/login/github/device-flow');
  });

  it('should navigate to login with personal access token', async () => {
    renderWithProviders(<LoginRoute />);

    await userEvent.click(screen.getByTestId('login-pat'));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/login/github/personal-access-token');
  });

  it('should navigate to login with oauth app', async () => {
    renderWithProviders(<LoginRoute />);

    await userEvent.click(screen.getByTestId('login-oauth-app'));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/login/github/oauth-app');
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
