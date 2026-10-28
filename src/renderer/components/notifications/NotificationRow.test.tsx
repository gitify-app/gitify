import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { renderWithProviders } from '../../__helpers__/test-utils';
import { mockGitHubEnterpriseServerAccount } from '../../__mocks__/account-mocks';
import {
  mockCommitGitifyNotification,
  mockGiteaGitifyNotification,
  mockGitifyNotification,
} from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';

import { getNotificationFailureKey, useNotificationActionFailuresStore } from '../../stores';

import { GroupBy } from '../../types';

import { Errors } from '../../utils/core/errors';
import * as comms from '../../utils/system/comms';
import * as links from '../../utils/system/links';
import {
  NotificationRow as ControlledNotificationRow,
  type NotificationRowProps as ControlledNotificationRowProps,
} from './NotificationRow';

type NotificationRowProps = Pick<ControlledNotificationRowProps, 'notification'> & {
  isRepositoryAnimatingExit: boolean;
};

function NotificationRow({ notification, isRepositoryAnimatingExit }: NotificationRowProps) {
  const [isAnimatingExit, setAnimatingExit] = useState(false);
  return (
    <ControlledNotificationRow
      notification={notification}
      isAnimatingExit={isAnimatingExit || isRepositoryAnimatingExit}
      onAnimateExit={setAnimatingExit}
    />
  );
}

describe('renderer/components/notifications/NotificationRow.tsx', () => {
  vi.spyOn(links, 'openNotification').mockImplementation(vi.fn());
  vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());
  vi.spyOn(globalThis.Date, 'now').mockImplementation(() => new Date('2024').valueOf());

  it('renders the notification content and actions when grouped by date', () => {
    const props: NotificationRowProps = {
      notification: mockGitifyNotification,
      isRepositoryAnimatingExit: false,
    };

    renderWithProviders(<NotificationRow {...props} />, {
      settings: { ...mockSettings, groupBy: GroupBy.DATE },
    });

    expect(screen.getByText('I am a robot and this is a test!')).toBeInTheDocument();
    expect(screen.getByText('gitify-app/notifications-test')).toBeInTheDocument();
    expect(screen.getByTestId('notification-reference')).toHaveAttribute('data-hidden', 'true');
    expect(screen.getByRole('button', { name: 'Mark as read' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark as done' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Unsubscribe from thread' })).toBeInTheDocument();
  });

  it('renders the reference when grouped by repository', () => {
    const props: NotificationRowProps = {
      notification: mockGitifyNotification,
      isRepositoryAnimatingExit: false,
    };

    renderWithProviders(<NotificationRow {...props} />, {
      settings: { ...mockSettings, groupBy: GroupBy.REPOSITORY },
    });

    expect(screen.getByText('I am a robot and this is a test!')).toBeInTheDocument();
    expect(screen.getByTestId('notification-reference')).not.toHaveAttribute('data-hidden');
  });

  it('hides the reference when showNumber is disabled', () => {
    const props: NotificationRowProps = {
      notification: mockGitifyNotification,
      isRepositoryAnimatingExit: false,
    };

    renderWithProviders(<NotificationRow {...props} />, {
      settings: { ...mockSettings, showNumber: false },
    });

    expect(screen.getByText('I am a robot and this is a test!')).toBeInTheDocument();
    expect(screen.getByTestId('notification-reference')).toHaveAttribute('data-hidden', 'true');
  });

  it('hides the issue number while hovered so it is never partially rendered', () => {
    const props: NotificationRowProps = {
      notification: mockGitifyNotification,
      isRepositoryAnimatingExit: false,
    };

    renderWithProviders(<NotificationRow {...props} />);

    // `group-hover:invisible` (not `hidden`) keeps the number's space but hides
    // it on hover, so the full-height rail can never leave it half-covered.
    expect(screen.getByText('123')).toHaveClass('group-hover:invisible');
  });

  it('shows the release tag as the identifier', () => {
    const props: NotificationRowProps = {
      notification: {
        ...mockGitifyNotification,
        subject: { ...mockGitifyNotification.subject, type: 'Release', tagName: '0.0.1' },
        display: { ...mockGitifyNotification.display, identifier: '0.0.1' },
      },
      isRepositoryAnimatingExit: false,
    };

    const tree = renderWithProviders(<NotificationRow {...props} />);

    expect(tree.getByText('0.0.1')).toBeInTheDocument();
  });

  it('shows the commit short SHA as the identifier', () => {
    const props: NotificationRowProps = {
      notification: mockCommitGitifyNotification,
      isRepositoryAnimatingExit: false,
    };

    const tree = renderWithProviders(<NotificationRow {...props} />);

    expect(tree.getByText('d2a86d8')).toBeInTheDocument();
  });

  it('hides read/done actions for a read notification', () => {
    const props: NotificationRowProps = {
      notification: { ...mockGitifyNotification, unread: false },
      isRepositoryAnimatingExit: false,
    };

    renderWithProviders(<NotificationRow {...props} />);

    expect(screen.getByText('I am a robot and this is a test!')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mark as read' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mark as done' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Unsubscribe from thread' })).toBeInTheDocument();
  });

  describe('notification interactions', () => {
    it('opens a notification in the browser - click', async () => {
      const markNotificationsAsReadMock = vi.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      renderWithProviders(<NotificationRow {...props} />, {
        settings: { ...mockSettings, markAsDoneOnOpen: false },
        markNotificationsAsRead: markNotificationsAsReadMock,
      });

      await userEvent.click(screen.getByTestId('notification-row'));

      expect(links.openNotification).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsReadMock).toHaveBeenCalledTimes(1);
    });

    it('opens a notification in the browser - delay notification setting enabled', async () => {
      const markNotificationsAsReadMock = vi.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      renderWithProviders(<NotificationRow {...props} />, {
        settings: {
          ...mockSettings,
          markAsDoneOnOpen: false,
          delayNotificationState: true,
        },
        markNotificationsAsRead: markNotificationsAsReadMock,
      });

      await userEvent.click(screen.getByTestId('notification-row'));

      expect(links.openNotification).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsReadMock).toHaveBeenCalledTimes(1);
    });

    it('opens a notification in browser & mark it as done', async () => {
      const markNotificationsAsDoneMock = vi.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      renderWithProviders(<NotificationRow {...props} />, {
        settings: { ...mockSettings, markAsDoneOnOpen: true },
        markNotificationsAsDone: markNotificationsAsDoneMock,
      });

      await userEvent.click(screen.getByTestId('notification-row'));

      expect(links.openNotification).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsDoneMock).toHaveBeenCalledTimes(1);
    });

    it('marks as done when markAsDoneOnOpen is true even with fetchReadNotifications enabled', async () => {
      const markNotificationsAsReadMock = vi.fn();
      const markNotificationsAsDoneMock = vi.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      renderWithProviders(<NotificationRow {...props} />, {
        settings: {
          ...mockSettings,
          markAsDoneOnOpen: true,
          fetchReadNotifications: true,
        },
        markNotificationsAsRead: markNotificationsAsReadMock,
        markNotificationsAsDone: markNotificationsAsDoneMock,
      });

      await userEvent.click(screen.getByTestId('notification-row'));

      expect(links.openNotification).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsDoneMock).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsReadMock).not.toHaveBeenCalled();
    });

    it('marks notifications as read', async () => {
      const markNotificationsAsReadMock = vi.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      renderWithProviders(<NotificationRow {...props} />, {
        settings: { ...mockSettings, markAsDoneOnOpen: false },
        markNotificationsAsRead: markNotificationsAsReadMock,
      });

      await userEvent.click(screen.getByRole('button', { name: 'Mark as read' }));

      expect(markNotificationsAsReadMock).toHaveBeenCalledTimes(1);
    });

    it('hides mark as read button when notification is already read', async () => {
      const props: NotificationRowProps = {
        notification: {
          ...mockGitifyNotification,
          unread: false,
        },
        isRepositoryAnimatingExit: false,
      };

      renderWithProviders(<NotificationRow {...props} />);

      expect(screen.queryByRole('button', { name: 'Mark as read' })).not.toBeInTheDocument();
    });

    it('marks notifications as done', async () => {
      const markNotificationsAsDoneMock = vi.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      renderWithProviders(<NotificationRow {...props} />, {
        settings: mockSettings,
        markNotificationsAsDone: markNotificationsAsDoneMock,
      });

      await userEvent.click(screen.getByRole('button', { name: 'Mark as done' }));

      expect(markNotificationsAsDoneMock).toHaveBeenCalledTimes(1);
    });

    it('hides mark as done button when notification is already read', async () => {
      const props: NotificationRowProps = {
        notification: {
          ...mockGitifyNotification,
          unread: false,
        },
        isRepositoryAnimatingExit: false,
      };

      renderWithProviders(<NotificationRow {...props} />);

      expect(screen.queryByRole('button', { name: 'Mark as done' })).not.toBeInTheDocument();
    });

    it('shows mark as done button when fetchReadNotifications is enabled and notification is unread', async () => {
      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      renderWithProviders(<NotificationRow {...props} />, {
        settings: { ...mockSettings, fetchReadNotifications: true },
      });

      expect(screen.getByRole('button', { name: 'Mark as done' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Mark as read' })).toBeInTheDocument();
    });

    it('unsubscribes from a notification thread', async () => {
      const unsubscribeNotificationMock = vi.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      renderWithProviders(<NotificationRow {...props} />, {
        unsubscribeNotification: unsubscribeNotificationMock,
      });

      await userEvent.click(screen.getByRole('button', { name: 'Unsubscribe from thread' }));

      expect(unsubscribeNotificationMock).toHaveBeenCalledTimes(1);
    });

    it('does not show unsubscribe for Gitea notifications', () => {
      const props: NotificationRowProps = {
        notification: mockGiteaGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      renderWithProviders(<NotificationRow {...props} />);

      expect(
        screen.queryByRole('button', { name: 'Unsubscribe from thread' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('failure recovery', () => {
    const failureKey = getNotificationFailureKey(
      mockGitifyNotification.account,
      mockGitifyNotification.id,
    );

    const recordFailure = (action: 'markAsRead' | 'markAsDone') => {
      act(() => {
        useNotificationActionFailuresStore.getState().setFailure(failureKey, {
          action,
          error: Errors.ACTION_FORBIDDEN,
        });
      });
    };

    afterEach(() => {
      act(() => useNotificationActionFailuresStore.getState().reset());
    });

    it('shows hover actions in their normal (non-danger) state when there is no recorded failure', () => {
      const props: NotificationRowProps = {
        notification: mockGitifyNotification,

        isRepositoryAnimatingExit: false,
      };

      renderWithProviders(<NotificationRow {...props} />);

      expect(screen.getByRole('button', { name: 'Mark as read' })).toHaveAttribute(
        'title',
        'Mark as read',
      );
    });
    it('restores its actions when the mutation fails directly', async () => {
      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      renderWithProviders(<NotificationRow {...props} />, {
        settings: { ...mockSettings, delayNotificationState: false, fetchReadNotifications: false },
        markNotificationsAsRead: vi.fn().mockResolvedValue(false),
      });

      await userEvent.click(screen.getByRole('button', { name: 'Mark as read' }));

      expect(screen.getByRole('button', { name: 'Mark as read' })).toBeInTheDocument();
    });

    it('styles and explains only the action that failed', () => {
      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      recordFailure('markAsRead');
      renderWithProviders(<NotificationRow {...props} />);

      const markAsReadButton = screen.getByTestId('notification-mark-as-read');

      // The row's actions remain available - the row is not in a broken state
      expect(markAsReadButton).toBeInTheDocument();
      expect(markAsReadButton).toHaveAttribute(
        'title',
        expect.stringContaining(Errors.ACTION_FORBIDDEN.title),
      );
      expect(markAsReadButton).toHaveAttribute(
        'title',
        expect.stringContaining('You can also try opening this notification in your browser.'),
      );
      expect(screen.getByRole('button', { name: 'Mark as done' })).toHaveAttribute(
        'title',
        'Mark as done',
      );
      expect(screen.getByRole('button', { name: 'Unsubscribe from thread' })).toHaveAttribute(
        'title',
        'Unsubscribe from thread',
      );
    });

    it('isolates failures for notifications with the same id across accounts', () => {
      const sameIdOtherAccount = {
        ...mockGitifyNotification,
        account: mockGitHubEnterpriseServerAccount,
      };
      recordFailure('markAsRead');

      renderWithProviders(
        <>
          <NotificationRow
            isRepositoryAnimatingExit={false}
            notification={mockGitifyNotification}
          />
          <NotificationRow isRepositoryAnimatingExit={false} notification={sameIdOtherAccount} />
        </>,
      );

      const [failedButton, unaffectedButton] = screen.getAllByTestId('notification-mark-as-read');
      expect(failedButton).toHaveAttribute(
        'title',
        expect.stringContaining(Errors.ACTION_FORBIDDEN.title),
      );
      expect(unaffectedButton).toHaveAttribute('title', 'Mark as read');
    });

    it('re-invokes the same action on click, acting as a retry, when a failure is recorded', async () => {
      const markNotificationsAsDoneMock = vi.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      recordFailure('markAsDone');
      renderWithProviders(<NotificationRow {...props} />, {
        markNotificationsAsDone: markNotificationsAsDoneMock,
      });

      await userEvent.click(screen.getByTestId('notification-mark-as-done'));

      expect(markNotificationsAsDoneMock).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsDoneMock).toHaveBeenCalledWith([mockGitifyNotification]);
    });

    it('does not disable retrying even for a permanently-failing classification like ACTION_FORBIDDEN', async () => {
      const markNotificationsAsReadMock = vi.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      recordFailure('markAsRead');
      renderWithProviders(<NotificationRow {...props} />, {
        markNotificationsAsRead: markNotificationsAsReadMock,
      });

      const markAsReadButton = screen.getByTestId('notification-mark-as-read');
      expect(markAsReadButton).toBeEnabled();

      await userEvent.click(markAsReadButton);

      expect(markNotificationsAsReadMock).toHaveBeenCalledTimes(1);
    });

    it('gives a retry its own exit-animation cycle even though the previous failure is still recorded', async () => {
      // Regression test: the revert logic reads the *current* failure store
      // state after each action settles, rather than an effect keyed off a
      // (possibly stale, still-present-from-the-previous-attempt) failure
      // map - so a retry always gets to animate out and, if it fails again,
      // animate back in, instead of being short-circuited immediately.
      recordFailure('markAsRead');

      let resolveRetry: () => void = () => {};
      const markNotificationsAsReadMock = vi.fn().mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveRetry = resolve;
          }),
      );

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      renderWithProviders(<NotificationRow {...props} />, {
        settings: { ...mockSettings, delayNotificationState: false, fetchReadNotifications: false },
        markNotificationsAsRead: markNotificationsAsReadMock,
      });

      await userEvent.click(screen.getByTestId('notification-mark-as-read'));

      // While the retry is still in flight, the row is animating out again -
      // its hover actions are hidden, exactly like the very first attempt.
      expect(screen.queryByTestId('notification-mark-as-read')).not.toBeInTheDocument();

      // The retry fails again; the store still has a (new) failure entry for
      // this notification once the mutation resolves.
      recordFailure('markAsRead');
      await act(async () => {
        resolveRetry();
      });

      await screen.findByTestId('notification-mark-as-read');
    });
  });
});
