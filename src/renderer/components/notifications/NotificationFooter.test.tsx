import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';
import {
  mockAgentSessionGitifyNotification,
  mockGitifyNotification,
} from '../../__mocks__/notifications-mocks';

import type { GitifyNotificationUser, Link } from '../../types';

import * as comms from '../../utils/system/comms';
import { NotificationFooter, type NotificationFooterProps } from './NotificationFooter';

describe('renderer/components/notifications/NotificationFooter.tsx', () => {
  vi.spyOn(globalThis.Date, 'now').mockImplementation(() => new Date('2024').valueOf());

  it('renders itself & its children', async () => {
    const props: NotificationFooterProps = {
      notification: mockGitifyNotification,
    };

    renderWithProviders(<NotificationFooter {...props} />);

    expect(screen.getByTestId('view-profile')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByText('Updated')).toBeInTheDocument();
  });

  it('reserves the action rail width on the footer', async () => {
    const props: NotificationFooterProps = {
      notification: mockGitifyNotification,
    };

    const tree = renderWithProviders(<NotificationFooter {...props} />);

    // The footer is inset so its pills wrap clear of the row's action rail.
    expect(tree.container.querySelector('.pr-\\[5\\.5rem\\]')).toBeInTheDocument();
  });

  describe('security alert avatars', () => {
    it('Repository Dependabot Alerts Thread', async () => {
      const mockNotification = mockGitifyNotification;
      mockNotification.subject.type = 'RepositoryDependabotAlertsThread';

      const props: NotificationFooterProps = {
        notification: mockNotification,
      };

      renderWithProviders(<NotificationFooter {...props} />);

      expect(screen.getByTestId('view-profile')).toBeInTheDocument();
      expect(screen.getByAltText('gitify-app')).toBeInTheDocument();
    });

    it('Repository Vulnerability Alert', async () => {
      const mockNotification = mockGitifyNotification;
      mockNotification.subject.type = 'RepositoryVulnerabilityAlert';

      const props: NotificationFooterProps = {
        notification: mockNotification,
      };

      renderWithProviders(<NotificationFooter {...props} />);

      expect(screen.getByTestId('view-profile')).toBeInTheDocument();
      expect(screen.getByAltText('gitify-app')).toBeInTheDocument();
    });
  });

  it('defaults to known avatar if no user found', async () => {
    const mockNotification = mockGitifyNotification;
    mockNotification.subject.user = undefined;

    const props: NotificationFooterProps = {
      notification: mockNotification,
    };

    renderWithProviders(<NotificationFooter {...props} />);

    expect(screen.queryByTestId('view-profile')).not.toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByText('Updated')).toBeInTheDocument();
  });

  it('presents the Copilot actor for an agent session notification', () => {
    renderWithProviders(<NotificationFooter notification={mockAgentSessionGitifyNotification} />);

    // Agent sessions have no enriched actor, so no profile button is rendered.
    expect(screen.queryByTestId('view-profile')).not.toBeInTheDocument();
    expect(screen.getByText('Agent Session Finished')).toBeInTheDocument();
  });

  it('opens notification user profile', async () => {
    const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());

    const props: NotificationFooterProps = {
      notification: {
        ...mockGitifyNotification,
        subject: {
          ...mockGitifyNotification.subject,
          user: {
            login: 'some-user',
            htmlUrl: 'https://github.com/some-user' as Link,
            avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4' as Link,
            type: 'User' as GitifyNotificationUser['type'],
          },
          reviewers: undefined,
        },
      },
    };

    renderWithProviders(<NotificationFooter {...props} />);

    await userEvent.click(screen.getByTestId('view-profile'));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(props.notification.subject.user!.htmlUrl);
  });

  it.each([
    ['github-actions[bot]', 'github-actions', 'https://github.com/apps/github-actions'],
    [
      'copilot[ai]',
      'copilot-pull-request-reviewer',
      'https://github.com/apps/copilot-pull-request-reviewer',
    ],
  ])('formats a GitHub App actor as %s in the avatar alt', (label, login, htmlUrl) => {
    const notification = {
      ...mockGitifyNotification,
      subject: {
        ...mockGitifyNotification.subject,
        user: {
          login,
          htmlUrl: htmlUrl as Link,
          avatarUrl: 'https://avatars.githubusercontent.com/u/1' as Link,
          type: 'Bot' as const,
        },
      },
    };

    renderWithProviders(<NotificationFooter notification={notification} />);

    expect(screen.getByAltText(label)).toBeInTheDocument();
    expect(screen.getByTitle(label)).toBeInTheDocument();
    expect(screen.queryByText(login)).not.toBeInTheDocument();
    expect(screen.queryByTestId('notification-user-badge')).not.toBeInTheDocument();
  });

  it('does not render a badge for an unsupported actor', () => {
    const notification = {
      ...mockGitifyNotification,
      subject: {
        ...mockGitifyNotification.subject,
        user: {
          login: 'octocat',
          htmlUrl: 'https://github.com/octocat' as Link,
          avatarUrl: 'https://avatars.githubusercontent.com/u/1' as Link,
          type: 'User' as const,
        },
      },
    };

    renderWithProviders(<NotificationFooter notification={notification} />);

    expect(screen.getByAltText('octocat')).toBeInTheDocument();
    expect(screen.getByTitle('octocat')).toBeInTheDocument();
    expect(screen.queryByText('octocat')).not.toBeInTheDocument();
    expect(screen.queryByTestId('notification-user-badge')).not.toBeInTheDocument();
  });

  it('uses the GitHub EMU profile name for hover and accessible avatar text', () => {
    const notification = {
      ...mockGitifyNotification,
      subject: {
        ...mockGitifyNotification.subject,
        user: {
          ...mockGitifyNotification.subject.user!,
          login: 'notification-author_gitify',
          name: 'Notification Author',
          avatarUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>' as Link,
          type: 'EnterpriseUserAccount' as const,
        },
      },
    };

    renderWithProviders(<NotificationFooter notification={notification} />);

    expect(screen.getByTestId('view-profile')).toHaveAttribute(
      'title',
      'Notification Author (notification-author_gitify)',
    );
    expect(
      screen.getByAltText('Notification Author (notification-author_gitify)'),
    ).toBeInTheDocument();
  });

  it('uses the GitHub handle for a regular user with a profile name', () => {
    const notification = {
      ...mockGitifyNotification,
      subject: {
        ...mockGitifyNotification.subject,
        user: {
          ...mockGitifyNotification.subject.user!,
          login: 'notification-author',
          name: 'Notification Author',
          avatarUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>' as Link,
          type: 'User' as const,
        },
      },
    };

    renderWithProviders(<NotificationFooter notification={notification} />);

    expect(screen.getByTestId('view-profile')).toHaveAttribute('title', 'notification-author');
    expect(screen.getByAltText('notification-author')).toBeInTheDocument();
  });

  it('uses the profile name for a managed account actor returned as User', () => {
    const notification = {
      ...mockGitifyNotification,
      account: {
        ...mockGitifyNotification.account,
        user: { ...mockGitifyNotification.account.user!, login: 'octocat_gitify' },
      },
      subject: {
        ...mockGitifyNotification.subject,
        user: {
          ...mockGitifyNotification.subject.user!,
          login: 'notification-author_gitify',
          name: 'Notification Author',
          avatarUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>' as Link,
          type: 'User' as const,
        },
      },
    };

    renderWithProviders(<NotificationFooter notification={notification} />);

    expect(screen.getByTestId('view-profile')).toHaveAttribute(
      'title',
      'Notification Author (notification-author_gitify)',
    );
    expect(
      screen.getByAltText('Notification Author (notification-author_gitify)'),
    ).toBeInTheDocument();
  });
});
