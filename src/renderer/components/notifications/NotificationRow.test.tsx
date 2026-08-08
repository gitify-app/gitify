import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';
import { mockGitHubEnterpriseServerAccount } from '../../__mocks__/account-mocks';
import {
  mockGiteaGitifyNotification,
  mockGitifyNotification,
} from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';

import { getNotificationFailureKey, useNotificationActionFailuresStore } from '../../stores';

import { GroupBy } from '../../types';

import { Errors } from '../../utils/core/errors';
import * as comms from '../../utils/system/comms';
import * as links from '../../utils/system/links';
import { NotificationRow, type NotificationRowProps } from './NotificationRow';

describe('renderer/components/notifications/NotificationRow.tsx', () => {
  vi.spyOn(links, 'openNotification').mockImplementation(vi.fn());
  vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());
  vi.spyOn(globalThis.Date, 'now').mockImplementation(() => new Date('2024').valueOf());

  it('should render itself & its children - group by date', async () => {
    const props: NotificationRowProps = {
      notification: mockGitifyNotification,
      isRepositoryAnimatingExit: false,
    };

    const tree = renderWithProviders(<NotificationRow {...props} />, {
      settings: { ...mockSettings, groupBy: GroupBy.DATE },
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children - group by repositories', async () => {
    const props: NotificationRowProps = {
      notification: mockGitifyNotification,
      isRepositoryAnimatingExit: false,
    };

    const tree = renderWithProviders(<NotificationRow {...props} />, {
      settings: { ...mockSettings, groupBy: GroupBy.REPOSITORY },
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children - hide numbers', async () => {
    const props: NotificationRowProps = {
      notification: mockGitifyNotification,
      isRepositoryAnimatingExit: false,
    };

    const tree = renderWithProviders(<NotificationRow {...props} />, {
      settings: { ...mockSettings, showNumber: false },
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children - notification is read', async () => {
    const props: NotificationRowProps = {
      notification: { ...mockGitifyNotification, unread: false },
      isRepositoryAnimatingExit: false,
    };

    const tree = renderWithProviders(<NotificationRow {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  describe('notification interactions', () => {
    it('should open a notification in the browser - click', async () => {
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

    it('should open a notification in the browser - delay notification setting enabled', async () => {
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

    it('should open a notification in browser & mark it as done', async () => {
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

    it('should mark as done when markAsDoneOnOpen is true even with fetchReadNotifications enabled', async () => {
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

    it('should mark notifications as read', async () => {
      const markNotificationsAsReadMock = vi.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      renderWithProviders(<NotificationRow {...props} />, {
        settings: { ...mockSettings, markAsDoneOnOpen: false },
        markNotificationsAsRead: markNotificationsAsReadMock,
      });

      await userEvent.click(screen.getByTestId('notification-mark-as-read'));

      expect(markNotificationsAsReadMock).toHaveBeenCalledTimes(1);
    });

    it('should hide mark as read button when notification is already read', async () => {
      const props: NotificationRowProps = {
        notification: {
          ...mockGitifyNotification,
          unread: false,
        },
        isRepositoryAnimatingExit: false,
      };

      renderWithProviders(<NotificationRow {...props} />);

      expect(screen.queryByTestId('notification-mark-as-read')).not.toBeInTheDocument();
    });

    it('should mark notifications as done', async () => {
      const markNotificationsAsDoneMock = vi.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      renderWithProviders(<NotificationRow {...props} />, {
        settings: mockSettings,
        markNotificationsAsDone: markNotificationsAsDoneMock,
      });

      await userEvent.click(screen.getByTestId('notification-mark-as-done'));

      expect(markNotificationsAsDoneMock).toHaveBeenCalledTimes(1);
    });

    it('should hide mark as done button when notification is already read', async () => {
      const props: NotificationRowProps = {
        notification: {
          ...mockGitifyNotification,
          unread: false,
        },
        isRepositoryAnimatingExit: false,
      };

      renderWithProviders(<NotificationRow {...props} />);

      expect(screen.queryByTestId('notification-mark-as-done')).not.toBeInTheDocument();
    });

    it('should show mark as done button when fetchReadNotifications is enabled and notification is unread', async () => {
      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      renderWithProviders(<NotificationRow {...props} />, {
        settings: { ...mockSettings, fetchReadNotifications: true },
      });

      expect(screen.getByTestId('notification-mark-as-done')).toBeInTheDocument();
      expect(screen.getByTestId('notification-mark-as-read')).toBeInTheDocument();
    });

    it('should unsubscribe from a notification thread', async () => {
      const unsubscribeNotificationMock = vi.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      renderWithProviders(<NotificationRow {...props} />, {
        unsubscribeNotification: unsubscribeNotificationMock,
      });

      await userEvent.click(screen.getByTestId('notification-unsubscribe-from-thread'));

      expect(unsubscribeNotificationMock).toHaveBeenCalledTimes(1);
    });

    it('should not show unsubscribe for Gitea notifications', () => {
      const props: NotificationRowProps = {
        notification: mockGiteaGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      renderWithProviders(<NotificationRow {...props} />);

      expect(screen.queryByTestId('notification-unsubscribe-from-thread')).not.toBeInTheDocument();
    });
  });

  describe('failure recovery', () => {
    const failureKey = getNotificationFailureKey(
      mockGitifyNotification.account,
      mockGitifyNotification.id,
    );

    afterEach(() => {
      useNotificationActionFailuresStore.getState().reset();
    });

    it('shows hover actions in their normal (non-danger) state when there is no recorded failure', () => {
      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      renderWithProviders(<NotificationRow {...props} />);

      expect(screen.getByTestId('notification-mark-as-read')).toHaveAttribute(
        'title',
        'Mark as read',
      );
    });

    it('styles and explains only the action that failed', () => {
      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      useNotificationActionFailuresStore.getState().setFailure(failureKey, {
        action: 'markAsRead',
        error: Errors.ACTION_FORBIDDEN,
      });
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
        expect.stringContaining('You can also try opening this notification in the browser.'),
      );
      expect(screen.getByTestId('notification-mark-as-done')).toHaveAttribute(
        'title',
        'Mark as done',
      );
      expect(screen.getByTestId('notification-unsubscribe-from-thread')).toHaveAttribute(
        'title',
        'Unsubscribe from thread',
      );
    });

    it('isolates failures for notifications with the same id across accounts', () => {
      const sameIdOtherAccount = {
        ...mockGitifyNotification,
        account: mockGitHubEnterpriseServerAccount,
      };
      useNotificationActionFailuresStore.getState().setFailure(failureKey, {
        action: 'markAsRead',
        error: Errors.ACTION_FORBIDDEN,
      });

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

      useNotificationActionFailuresStore.getState().setFailure(failureKey, {
        action: 'markAsDone',
        error: Errors.ACTION_FORBIDDEN,
      });
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

      useNotificationActionFailuresStore.getState().setFailure(failureKey, {
        action: 'markAsRead',
        error: Errors.ACTION_FORBIDDEN,
      });
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
      useNotificationActionFailuresStore.getState().setFailure(failureKey, {
        action: 'markAsRead',
        error: Errors.ACTION_FORBIDDEN,
      });

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
      useNotificationActionFailuresStore.getState().setFailure(failureKey, {
        action: 'markAsRead',
        error: Errors.ACTION_FORBIDDEN,
      });
      resolveRetry();

      await screen.findByTestId('notification-mark-as-read');
    });
  });
});
