import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';
import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';

import * as links from '../../utils/system/links';
import { AccountHeader, type AccountHeaderProps } from './AccountHeader';

describe('renderer/components/notifications/AccountHeader.tsx', () => {
  const props: AccountHeaderProps = {
    account: mockGitHubCloudAccount,
    error: null,
    notificationCount: 3,
    isCollapsed: false,
    onToggle: vi.fn(),
  };

  it('renders the managed GitHub account identity', () => {
    renderWithProviders(
      <AccountHeader
        {...props}
        account={{
          ...mockGitHubCloudAccount,
          user: {
            ...mockGitHubCloudAccount.user!,
            login: 'octocat_gitify',
            name: 'Mona Lisa Octocat',
          },
        }}
      />,
    );

    expect(screen.getByText('octocat_gitify')).toBeInTheDocument();
    expect(screen.getByAltText('octocat_gitify')).toBeInTheDocument();
  });

  it('opens profile when clicked', async () => {
    const openAccountProfileSpy = vi.spyOn(links, 'openAccountProfile').mockImplementation(vi.fn());
    const onToggle = vi.fn();

    renderWithProviders(<AccountHeader {...props} onToggle={onToggle} />);

    await userEvent.click(screen.getByTestId('account-profile'));

    expect(openAccountProfileSpy).toHaveBeenCalledWith(mockGitHubCloudAccount);
    // The header's own click toggles collapse; the profile button must not.
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('opens my issues when clicked', async () => {
    const openHostIssuesSpy = vi.spyOn(links, 'openHostIssues').mockImplementation(vi.fn());

    renderWithProviders(<AccountHeader {...props} />);

    await userEvent.click(screen.getByTestId('account-issues'));

    expect(openHostIssuesSpy).toHaveBeenCalledWith(mockGitHubCloudAccount);
  });

  it('opens my pull requests when clicked', async () => {
    const openHostPullsSpy = vi.spyOn(links, 'openHostPulls').mockImplementation(vi.fn());

    renderWithProviders(<AccountHeader {...props} />);

    await userEvent.click(screen.getByTestId('account-pull-requests'));

    expect(openHostPullsSpy).toHaveBeenCalledWith(mockGitHubCloudAccount);
  });

  it('requests a collapse toggle when toggled', async () => {
    const onToggle = vi.fn();

    renderWithProviders(<AccountHeader {...props} onToggle={onToggle} />);

    await userEvent.click(screen.getByTestId('account-toggle'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('labels the toggle to hide notifications when expanded', () => {
    renderWithProviders(<AccountHeader {...props} />);

    expect(screen.getByTestId('account-toggle')).toHaveAttribute(
      'title',
      'Hide account notifications',
    );
  });

  it('labels the toggle to show notifications when collapsed', () => {
    renderWithProviders(<AccountHeader {...props} isCollapsed />);

    expect(screen.getByTestId('account-toggle')).toHaveAttribute(
      'title',
      'Show account notifications',
    );
  });

  it('renders an error background when the account errored', () => {
    const tree = renderWithProviders(
      <AccountHeader
        {...props}
        error={{ title: 'Error title', descriptions: ['Error description'], emojis: ['🔥'] }}
        notificationCount={0}
      />,
    );

    expect(tree!.container).toMatchSnapshot();
  });
});
