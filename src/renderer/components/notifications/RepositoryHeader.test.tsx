import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

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

  function ControlledRepositoryHeader() {
    const [isAnimatingExit, setAnimatingExit] = useState(false);

    return (
      <RepositoryHeader
        isAnimatingExit={isAnimatingExit}
        isCollapsed={props.isCollapsed}
        onAnimateExit={setAnimatingExit}
        onToggle={props.onToggle}
        repoName={props.repoName}
        repoNotifications={props.repoNotifications}
      />
    );
  }

  it('renders the repository and its actions', () => {
    renderWithProviders(<RepositoryHeader {...props} />);

    expect(screen.getByText('gitify-app/notifications-test')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open repository/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark repository as read' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark repository as done' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Hide repository notifications' }),
    ).toBeInTheDocument();
  });

  it('hides the unread-only actions when all notifications are read', () => {
    renderWithProviders(
      <RepositoryHeader
        {...props}
        repoNotifications={mockGitHubCloudGitifyNotifications.map((n) => ({
          ...n,
          unread: false,
        }))}
      />,
    );

    expect(screen.getByText('gitify-app/notifications-test')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open repository/ })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Mark repository as read' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Mark repository as done' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Hide repository notifications' }),
    ).toBeInTheDocument();
  });

  it('opens the browser when clicking on the repo name', async () => {
    const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());

    renderWithProviders(<RepositoryHeader {...props} />);

    await userEvent.click(screen.getByRole('button', { name: /Open repository/ }));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://github.com/gitify-app/notifications-test',
    );
  });

  it('marks a repo as read', async () => {
    const markNotificationsAsReadMock = vi.fn();

    renderWithProviders(<RepositoryHeader {...props} />, {
      settings: { ...mockSettings },
      markNotificationsAsRead: markNotificationsAsReadMock,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Mark repository as read' }));

    expect(markNotificationsAsReadMock).toHaveBeenCalledWith(mockGitHubCloudGitifyNotifications);
  });

  it('marks a repo as done', async () => {
    const markNotificationsAsDoneMock = vi.fn();

    renderWithProviders(<RepositoryHeader {...props} />, {
      settings: { ...mockSettings },
      markNotificationsAsDone: markNotificationsAsDoneMock,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Mark repository as done' }));

    expect(markNotificationsAsDoneMock).toHaveBeenCalledWith(mockGitHubCloudGitifyNotifications);
  });

  it('uses default repository icon when avatar is not available', () => {
    const repoNotifications = mockGitHubCloudGitifyNotifications.map((n) => ({
      ...n,
      repository: { ...n.repository, owner: { ...n.repository.owner, avatarUrl: '' as Link } },
    }));

    renderWithProviders(<RepositoryHeader {...props} repoNotifications={repoNotifications} />);

    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open repository/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark repository as read' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark repository as done' })).toBeInTheDocument();
  });

  it('requests a collapse toggle when toggled', async () => {
    const onToggle = vi.fn();

    renderWithProviders(<RepositoryHeader {...props} onToggle={onToggle} />);

    await userEvent.click(screen.getByRole('button', { name: 'Hide repository notifications' }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('hides its hover actions while animating out', () => {
    renderWithProviders(<RepositoryHeader {...props} isAnimatingExit />);

    expect(
      screen.queryByRole('button', { name: 'Mark repository as read' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /repository notifications/ }),
    ).not.toBeInTheDocument();
  });

  it('marks the exit wrapper while a group action is pending and clears it on failure', async () => {
    let resolveAction: () => void = () => {};
    const markNotificationsAsReadMock = vi.fn().mockImplementation(
      () =>
        new Promise<boolean>((resolve) => {
          resolveAction = () => resolve(false);
        }),
    );

    renderWithProviders(<ControlledRepositoryHeader />, {
      settings: { ...mockSettings },
      markNotificationsAsRead: markNotificationsAsReadMock,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Mark repository as read' }));

    expect(document.querySelector('[data-exit-motion]')).toBeInTheDocument();
    expect(document.querySelector('[data-exit-collapse]')).toBeInTheDocument();

    await act(async () => {
      resolveAction();
    });

    expect(document.querySelector('[data-exit-motion]')).toBeNull();
    expect(document.querySelector('[data-exit-collapse]')).toBeNull();
    expect(screen.getByRole('button', { name: 'Mark repository as read' })).toBeInTheDocument();
  });

  it('clears the group exit animation when the action settles', async () => {
    const onAnimateExit = vi.fn();

    renderWithProviders(<RepositoryHeader {...props} onAnimateExit={onAnimateExit} />, {
      settings: { ...mockSettings },
      markNotificationsAsRead: vi.fn(),
    });

    await userEvent.click(screen.getByRole('button', { name: 'Mark repository as read' }));

    expect(onAnimateExit.mock.calls).toEqual([[true], [false]]);
  });

  describe('partial bulk failure', () => {
    afterEach(() => {
      useNotificationActionFailuresStore.getState().reset();
    });

    it('reverts the group exit animation when a notification within the bulk action failed', async () => {
      const [, secondNotification] = mockGitHubCloudGitifyNotifications;
      const onAnimateExit = vi.fn();

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

      await userEvent.click(screen.getByRole('button', { name: 'Mark repository as read' }));

      expect(onAnimateExit.mock.calls).toEqual([[true], [false]]);
    });

    it('reverts the group exit animation when the mutation fails directly', async () => {
      const onAnimateExit = vi.fn();

      renderWithProviders(<RepositoryHeader {...props} onAnimateExit={onAnimateExit} />, {
        settings: { ...mockSettings },
        markNotificationsAsRead: vi.fn().mockResolvedValue(false),
      });

      await userEvent.click(screen.getByRole('button', { name: 'Mark repository as read' }));

      expect(onAnimateExit.mock.calls).toEqual([[true], [false]]);
    });
  });
});
