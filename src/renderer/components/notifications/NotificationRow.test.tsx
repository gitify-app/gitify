import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';

import { GroupBy, useSettingsStore } from '../../stores';

import * as comms from '../../utils/comms';
import * as links from '../../utils/links';
import { NotificationRow, type NotificationRowProps } from './NotificationRow';

describe('renderer/components/notifications/NotificationRow.tsx', () => {
  vi.spyOn(links, 'openNotification').mockImplementation(vi.fn());
  vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());
  vi.spyOn(globalThis.Date, 'now').mockImplementation(() =>
    new Date('2024').valueOf(),
  );

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render itself & its children - group by date', async () => {
    useSettingsStore.setState({
      groupBy: GroupBy.DATE,
    });

    const props: NotificationRowProps = {
      notification: mockGitifyNotification,
      isRepositoryAnimatingExit: false,
    };

    const tree = renderWithAppContext(<NotificationRow {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children - group by repositories', async () => {
    useSettingsStore.setState({
      groupBy: GroupBy.REPOSITORY,
    });

    const props: NotificationRowProps = {
      notification: mockGitifyNotification,
      isRepositoryAnimatingExit: false,
    };

    const tree = renderWithAppContext(<NotificationRow {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children - hide numbers', async () => {
    useSettingsStore.setState({
      showNumber: false,
    });

    const props: NotificationRowProps = {
      notification: mockGitifyNotification,
      isRepositoryAnimatingExit: false,
    };

    const tree = renderWithAppContext(<NotificationRow {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children - notification is read', async () => {
    const props: NotificationRowProps = {
      notification: { ...mockGitifyNotification, unread: false },
      isRepositoryAnimatingExit: false,
    };

    const tree = renderWithAppContext(<NotificationRow {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  describe('notification interactions', () => {
    it('should open a notification in the browser - click', async () => {
      useSettingsStore.setState({
        markAsDoneOnOpen: false,
      });

      const markNotificationsAsReadMock = vi.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      renderWithAppContext(<NotificationRow {...props} />, {
        markNotificationsAsRead: markNotificationsAsReadMock,
      });

      await userEvent.click(screen.getByTestId('notification-row'));

      expect(links.openNotification).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsReadMock).toHaveBeenCalledTimes(1);
    });

    it('should open a notification in the browser - delay notification setting enabled', async () => {
      useSettingsStore.setState({
        markAsDoneOnOpen: false,
        delayNotificationState: true,
      });

      const markNotificationsAsReadMock = vi.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      renderWithAppContext(<NotificationRow {...props} />, {
        markNotificationsAsRead: markNotificationsAsReadMock,
      });

      await userEvent.click(screen.getByTestId('notification-row'));

      expect(links.openNotification).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsReadMock).toHaveBeenCalledTimes(1);
    });

    it('should open a notification in browser & mark it as done', async () => {
      useSettingsStore.setState({
        markAsDoneOnOpen: true,
      });

      const markNotificationsAsDoneMock = vi.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      renderWithAppContext(<NotificationRow {...props} />, {
        markNotificationsAsDone: markNotificationsAsDoneMock,
      });

      await userEvent.click(screen.getByTestId('notification-row'));

      expect(links.openNotification).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsDoneMock).toHaveBeenCalledTimes(1);
    });

    it('should mark as done when markAsDoneOnOpen is true even with fetchReadNotifications enabled', async () => {
      useSettingsStore.setState({
        markAsDoneOnOpen: true,
        delayNotificationState: true,
      });

      const markNotificationsAsReadMock = vi.fn();
      const markNotificationsAsDoneMock = vi.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      renderWithAppContext(<NotificationRow {...props} />, {
        markNotificationsAsRead: markNotificationsAsReadMock,
        markNotificationsAsDone: markNotificationsAsDoneMock,
      });

      await userEvent.click(screen.getByTestId('notification-row'));

      expect(links.openNotification).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsDoneMock).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsReadMock).not.toHaveBeenCalled();
    });

    it('should mark notifications as read', async () => {
      useSettingsStore.setState({
        markAsDoneOnOpen: false,
      });

      const markNotificationsAsReadMock = vi.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      renderWithAppContext(<NotificationRow {...props} />, {
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

      renderWithAppContext(<NotificationRow {...props} />);

      expect(
        screen.queryByTestId('notification-mark-as-read'),
      ).not.toBeInTheDocument();
    });

    it('should mark notifications as done', async () => {
      const markNotificationsAsDoneMock = vi.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      renderWithAppContext(<NotificationRow {...props} />, {
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

      renderWithAppContext(<NotificationRow {...props} />);

      expect(
        screen.queryByTestId('notification-mark-as-done'),
      ).not.toBeInTheDocument();
    });

    it('should show mark as done button when fetchReadNotifications is enabled and notification is unread', async () => {
      useSettingsStore.setState({
        fetchReadNotifications: true,
      });

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      renderWithAppContext(<NotificationRow {...props} />);

      expect(
        screen.getByTestId('notification-mark-as-done'),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('notification-mark-as-read'),
      ).toBeInTheDocument();
    });

    it('should unsubscribe from a notification thread', async () => {
      const unsubscribeNotificationMock = vi.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
        isRepositoryAnimatingExit: false,
      };

      renderWithAppContext(<NotificationRow {...props} />, {
        unsubscribeNotification: unsubscribeNotificationMock,
      });

      await userEvent.click(
        screen.getByTestId('notification-unsubscribe-from-thread'),
      );

      expect(unsubscribeNotificationMock).toHaveBeenCalledTimes(1);
    });
  });
});
