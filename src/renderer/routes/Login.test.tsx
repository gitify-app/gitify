import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../__helpers__/test-utils';
import { mockGitHubCloudAccount } from '../__mocks__/account-mocks';

import * as comms from '../utils/system/comms';
import { LoginRoute } from './Login';

describe('renderer/routes/Login.tsx', () => {
  it('renders the forge chooser, primary action, and secondary methods at rest', () => {
    renderWithProviders(<LoginRoute />);

    expect(screen.getByRole('heading', { name: 'Git Notifications' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'on your menu bar' })).toBeInTheDocument();

    const tabs = screen.getByRole('tablist', { name: 'Choose a forge' });
    expect(within(tabs).getByRole('tab', { name: 'GitHub' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(within(tabs).getByRole('tab', { name: 'Gitea' })).toBeInTheDocument();
    expect(within(tabs).getByRole('tab', { name: 'GitLab' })).toBeInTheDocument();
    expect(within(tabs).getByRole('tab', { name: 'Bitbucket' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Continue with GitHub' })).toBeInTheDocument();
    expect(screen.getByText('or')).toBeInTheDocument();
    const personalAccessToken = screen.getByRole('button', { name: 'Personal Access Token' });
    expect(within(personalAccessToken).getByText('PAT')).toBeInTheDocument();
    const gitHubCli = screen.getByRole('button', { name: 'GitHub CLI' });
    expect(within(gitHubCli).getByText('CLI')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Custom OAuth App' })).toHaveTextContent(
      'Custom OAuth App',
    );
    expect(screen.getByText('GitHub Cloud & GitHub Enterprise Server')).toBeInTheDocument();

    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('redirects to notifications once logged in', () => {
    const showWindowSpy = vi.spyOn(comms, 'showWindow');

    renderWithProviders(<LoginRoute />, {
      accounts: [mockGitHubCloudAccount],
    });

    expect(showWindowSpy).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
  });

  it('navigates from the primary GitHub action', async () => {
    renderWithProviders(<LoginRoute />);

    await userEvent.click(screen.getByRole('button', { name: 'Continue with GitHub' }));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/login/github/device-flow');
  });

  it.each([
    ['Personal Access Token', '/login/github/personal-access-token'],
    ['GitHub CLI', '/login/github/cli'],
    ['Custom OAuth App', '/login/github/custom-oauth-app'],
  ])('navigates to %s from the GitHub secondary methods', async (name, route) => {
    renderWithProviders(<LoginRoute />);

    await userEvent.click(screen.getByRole('button', { name }));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith(route);
  });

  it('moves from the primary action through the secondary buttons with Tab', async () => {
    renderWithProviders(<LoginRoute />);

    screen.getByRole('button', { name: 'Continue with GitHub' }).focus();

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Personal Access Token' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'GitHub CLI' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Custom OAuth App' })).toHaveFocus();
  });

  it('navigates to login with Gitea personal access token', async () => {
    renderWithProviders(<LoginRoute />);

    await userEvent.click(screen.getByRole('tab', { name: 'Gitea' }));
    await userEvent.click(screen.getByRole('button', { name: 'Continue with Gitea' }));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/login/gitea/personal-access-token');
  });

  it.each(['Gitea', 'GitLab', 'Bitbucket'])(
    'renders no secondary methods for the single-method %s forge',
    async (forge) => {
      renderWithProviders(<LoginRoute />);

      await userEvent.click(screen.getByRole('tab', { name: forge }));

      const panel = screen.getByRole('tabpanel');
      expect(
        within(panel).getByRole('button', { name: `Continue with ${forge}` }),
      ).toBeInTheDocument();
      expect(within(panel).queryByText('or')).not.toBeInTheDocument();
      expect(
        within(panel).queryByRole('button', { name: 'Personal Access Token' }),
      ).not.toBeInTheDocument();
      expect(within(panel).queryByRole('button', { name: 'GitHub CLI' })).not.toBeInTheDocument();
      expect(
        within(panel).queryByRole('button', { name: 'Custom OAuth App' }),
      ).not.toBeInTheDocument();
    },
  );

  it('animates the panel in the direction of the selected forge', async () => {
    renderWithProviders(<LoginRoute />);

    expect(screen.getByTestId('active-forge-panel')).toHaveClass('animate-login-panel-in-right');

    await userEvent.click(screen.getByRole('tab', { name: 'Gitea' }));
    expect(screen.getByTestId('active-forge-panel')).toHaveClass('animate-login-panel-in-right');

    await userEvent.click(screen.getByRole('tab', { name: 'GitHub' }));
    expect(screen.getByTestId('active-forge-panel')).toHaveClass('animate-login-panel-in-left');
  });

  it('switches the visible primary action when changing forges', async () => {
    renderWithProviders(<LoginRoute />);

    expect(screen.getByRole('button', { name: 'Continue with GitHub' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue with Gitea' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Gitea' }));

    expect(screen.queryByRole('button', { name: 'Continue with GitHub' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue with Gitea' })).toBeInTheDocument();
  });
});
