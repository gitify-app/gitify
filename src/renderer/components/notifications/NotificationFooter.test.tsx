import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';

import type { GitifyNotificationUser, Link } from '../../types';

import * as comms from '../../utils/system/comms';
import { NotificationFooter, type NotificationFooterProps } from './NotificationFooter';

describe('renderer/components/notifications/NotificationFooter.tsx', () => {
  vi.spyOn(globalThis.Date, 'now').mockImplementation(() => new Date('2024').valueOf());

  it('should render itself & its children', async () => {
    const props: NotificationFooterProps = {
      notification: mockGitifyNotification,
    };

    const tree = renderWithProviders(<NotificationFooter {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  describe('security alerts should use github icon for avatar', () => {
    it('Repository Dependabot Alerts Thread', async () => {
      const mockNotification = mockGitifyNotification;
      mockNotification.subject.type = 'RepositoryDependabotAlertsThread';

      const props: NotificationFooterProps = {
        notification: mockNotification,
      };

      const tree = renderWithProviders(<NotificationFooter {...props} />);

      expect(tree.container).toMatchSnapshot();
    });

    it('Repository Vulnerability Alert', async () => {
      const mockNotification = mockGitifyNotification;
      mockNotification.subject.type = 'RepositoryVulnerabilityAlert';

      const props: NotificationFooterProps = {
        notification: mockNotification,
      };

      const tree = renderWithProviders(<NotificationFooter {...props} />);

      expect(tree.container).toMatchSnapshot();
    });
  });

  it('should default to known avatar if no user found', async () => {
    const mockNotification = mockGitifyNotification;
    mockNotification.subject.user = undefined;

    const props: NotificationFooterProps = {
      notification: mockNotification,
    };

    const tree = renderWithProviders(<NotificationFooter {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it.each(['Issue', 'PullRequest'] as const)('should show %s authors on hover', (type) => {
    const props: NotificationFooterProps = {
      notification: {
        ...mockGitifyNotification,
        subject: {
          ...mockGitifyNotification.subject,
          author: {
            login: 'thread-author',
            htmlUrl: 'https://github.com/thread-author' as Link,
            avatarUrl: 'https://avatars.githubusercontent.com/u/123?v=4' as Link,
            type: 'User' as GitifyNotificationUser['type'],
          },
          type,
        },
      },
    };

    renderWithProviders(<NotificationFooter {...props} />);

    expect(screen.getByText('by thread-author')).toHaveClass('hidden', 'group-hover:inline');
  });

  it('should not show authors for other notification types', () => {
    const props: NotificationFooterProps = {
      notification: {
        ...mockGitifyNotification,
        subject: {
          ...mockGitifyNotification.subject,
          type: 'Release',
        },
      },
    };

    renderWithProviders(<NotificationFooter {...props} />);

    expect(
      screen.queryByText(`by ${mockGitifyNotification.subject.author!.login}`),
    ).not.toBeInTheDocument();
  });

  it('should open notification user profile', async () => {
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
          reviews: undefined,
        },
      },
    };

    renderWithProviders(<NotificationFooter {...props} />);

    await userEvent.click(screen.getByTestId('view-profile'));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(props.notification.subject.user!.htmlUrl);
  });

  it('should open notification author profile', async () => {
    const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());

    const props: NotificationFooterProps = {
      notification: {
        ...mockGitifyNotification,
        subject: {
          ...mockGitifyNotification.subject,
          author: {
            login: 'issue-author',
            htmlUrl: 'https://github.com/issue-author' as Link,
            avatarUrl: 'https://avatars.githubusercontent.com/u/123?v=4' as Link,
            type: 'User' as GitifyNotificationUser['type'],
          },
          reviews: undefined,
          type: 'Issue',
        },
      },
    };

    renderWithProviders(<NotificationFooter {...props} />);

    await userEvent.click(screen.getByTestId('view-author-profile'));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(props.notification.subject.author!.htmlUrl);
  });
});
