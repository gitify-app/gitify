import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';
import { mockGitHubCloudGitifyNotifications } from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';

import { getNotificationFailureKey, useNotificationActionFailuresStore } from '../../stores';

import type { Link } from '../../types';

import * as comms from '../../utils/system/comms';
import { RepositoryHeader, type RepositoryHeaderProps } from './RepositoryHeader';

describe('renderer/components/notifications/RepositoryHeader.tsx', () => {
  const props: RepositoryHeaderProps = {
    repoName: 'gitify-app/notifications-test',
    repoNotifications: mockGitHubCloudGitifyNotifications,
    isCollapsed: false,
    isAnimatingExit: false,
    onToggle: vi.fn(),
    onAnimateExit: vi.fn(),
  };

  it('should render itself & its children', () => {
    const tree = renderWithProviders(<RepositoryHeader {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children - all notifications are read', () => {
    const tree = renderWithProviders(
      <RepositoryHeader
        {...props}
        repoNotifications={mockGitHubCloudGitifyNotifications.map((n) => ({
          ...n,
          unread: false,
        }))}
      />,
    );

    expect(tree.container).toMatchSnapshot();
  });

  it('should open the browser when clicking on the repo name', async () => {
    const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());

    renderWithProviders(<RepositoryHeader {...props} />);

    await userEvent.click(screen.getByTestId('open-repository'));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://github.com/gitify-app/notifications-test',
    );
  });

  it('should mark a repo as read', async () => {
    const markNotificationsAsReadMock = vi.fn();

    renderWithProviders(<RepositoryHeader {...props} />, {
      settings: { ...mockSettings },
      markNotificationsAsRead: markNotificationsAsReadMock,
    });

    await userEvent.click(screen.getByTestId('repository-mark-as-read'));

    expect(markNotificationsAsReadMock).toHaveBeenCalledWith(mockGitHubCloudGitifyNotifications);
  });

  it('should mark a repo as done', async () => {
    const markNotificationsAsDoneMock = vi.fn();

    renderWithProviders(<RepositoryHeader {...props} />, {
      settings: { ...mockSettings },
      markNotificationsAsDone: markNotificationsAsDoneMock,
    });

    await userEvent.click(screen.getByTestId('repository-mark-as-done'));

    expect(markNotificationsAsDoneMock).toHaveBeenCalledWith(mockGitHubCloudGitifyNotifications);
  });

  it('should use default repository icon when avatar is not available', () => {
    const repoNotifications = mockGitHubCloudGitifyNotifications.map((n) => ({
      ...n,
      repository: { ...n.repository, owner: { ...n.repository.owner, avatarUrl: '' as Link } },
    }));

    const tree = renderWithProviders(
      <RepositoryHeader {...props} repoNotifications={repoNotifications} />,
    );

    expect(tree.container).toMatchSnapshot();
  });

  it('should request a collapse toggle when toggled', async () => {
    const onToggle = vi.fn();

    renderWithProviders(<RepositoryHeader {...props} onToggle={onToggle} />);

    await userEvent.click(screen.getByTestId('repository-toggle'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('should hide its hover actions while animating out', () => {
    renderWithProviders(<RepositoryHeader {...props} isAnimatingExit />);

    expect(screen.queryByTestId('repository-mark-as-read')).not.toBeInTheDocument();
    expect(screen.queryByTestId('repository-toggle')).not.toBeInTheDocument();
  });

  it('starts the group exit animation when marking the repository', async () => {
    const onAnimateExit = vi.fn();

    renderWithProviders(<RepositoryHeader {...props} onAnimateExit={onAnimateExit} />, {
      settings: { ...mockSettings },
      markNotificationsAsRead: vi.fn(),
    });

    await userEvent.click(screen.getByTestId('repository-mark-as-read'));

    expect(onAnimateExit.mock.calls).toEqual([[true]]);
  });

  describe('partial bulk failure', () => {
    afterEach(() => {
      useNotificationActionFailuresStore.getState().reset();
    });

    it('reverts the group exit animation when a notification within the bulk action failed', async () => {
      const [, secondNotification] = mockGitHubCloudGitifyNotifications;
      const onAnimateExit = vi.fn();

      // Simulate the mutation reconciliation that records a failure in the
      // real (non-mocked) failure store, since `runGroupAction` reads
      // directly from it rather than through the mocked `useNotifications`
      // hook.
      const markNotificationsAsReadWithFailure = vi.fn().mockImplementation(async () => {
        const failureKey = getNotificationFailureKey(
          secondNotification.account,
          secondNotification.id,
        );
        useNotificationActionFailuresStore.getState().setFailure(failureKey, {
          action: 'markAsRead',
          error: { title: 'Action Forbidden', descriptions: [], emojis: [] },
        });
      });

      renderWithProviders(<RepositoryHeader {...props} onAnimateExit={onAnimateExit} />, {
        settings: { ...mockSettings },
        markNotificationsAsRead: markNotificationsAsReadWithFailure,
      });

      await userEvent.click(screen.getByTestId('repository-mark-as-read'));

      expect(onAnimateExit.mock.calls).toEqual([[true], [false]]);
    });
  });
});
