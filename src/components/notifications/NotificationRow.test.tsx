import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';

import { GroupBy } from '../../types';

import * as comms from '../../utils/comms';
import * as links from '../../utils/links';
import { NotificationRow } from './NotificationRow';

describe('renderer/components/notifications/NotificationRow.tsx', () => {
  vi.spyOn(links, 'openNotification').mockImplementation(async () => {});
  vi.spyOn(comms, 'openExternalLink').mockImplementation(() => {});
  vi.spyOn(globalThis.Date, 'now').mockImplementation(() =>
    new Date('2024').valueOf(),
  );

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render itself & its children - group by date', async () => {
    const props = {
      notification: mockGitifyNotification,
      account: mockGitHubCloudAccount,
    };

    const tree = renderWithAppContext(<NotificationRow {...props} />, {
      settings: { ...mockSettings, groupBy: GroupBy.DATE },
    });

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - group by repositories', async () => {
    const props = {
      notification: mockGitifyNotification,
      account: mockGitHubCloudAccount,
    };

    const tree = renderWithAppContext(<NotificationRow {...props} />, {
      settings: { ...mockSettings, groupBy: GroupBy.REPOSITORY },
    });

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - hide numbers', async () => {
    const props = {
      notification: mockGitifyNotification,
      account: mockGitHubCloudAccount,
    };

    const tree = renderWithAppContext(<NotificationRow {...props} />, {
      settings: { ...mockSettings, showNumber: false },
    });

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - notification is read', async () => {
    const props = {
      notification: {
        ...mockGitifyNotification,
        unread: false,
      },
      account: mockGitHubCloudAccount,
    };

    const tree = renderWithAppContext(<NotificationRow {...props} />);

    expect(tree).toMatchSnapshot();
  });

  describe('notification interactions', () => {
    it('should open a notification in the browser - click', async () => {
      const markNotificationsAsReadMock = vi.fn();

      const props = {
        notification: mockGitifyNotification,
        account: mockGitHubCloudAccount,
      };

      renderWithAppContext(<NotificationRow {...props} />, {
        settings: { ...mockSettings, markAsDoneOnOpen: false },
        markNotificationsAsRead: markNotificationsAsReadMock,
      });

      await userEvent.click(screen.getByTestId('notification-row'));

      expect(links.openNotification).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsReadMock).toHaveBeenCalledTimes(1);
    });

    it('should open a notification in the browser - delay notification setting enabled', async () => {
      const markNotificationsAsReadMock = vi.fn();

      const props = {
        notification: mockGitifyNotification,
        account: mockGitHubCloudAccount,
      };

      renderWithAppContext(<NotificationRow {...props} />, {
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

      const props = {
        notification: mockGitifyNotification,
        account: mockGitHubCloudAccount,
      };

      renderWithAppContext(<NotificationRow {...props} />, {
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

      const props = {
        notification: mockGitifyNotification,
        account: mockGitHubCloudAccount,
      };

      renderWithAppContext(<NotificationRow {...props} />, {
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

      const props = {
        notification: mockGitifyNotification,
        account: mockGitHubCloudAccount,
      };

      renderWithAppContext(<NotificationRow {...props} />, {
        settings: { ...mockSettings, markAsDoneOnOpen: false },
        markNotificationsAsRead: markNotificationsAsReadMock,
      });

      await userEvent.click(screen.getByTestId('notification-mark-as-read'));

      expect(markNotificationsAsReadMock).toHaveBeenCalledTimes(1);
    });

    it('should hide mark as read button when notification is already read', async () => {
      const readNotification = {
        ...mockGitifyNotification,
        unread: false,
      };

      const props = {
        notification: readNotification,
        account: mockGitHubCloudAccount,
      };

      renderWithAppContext(<NotificationRow {...props} />);

      expect(
        screen.queryByTestId('notification-mark-as-read'),
      ).not.toBeInTheDocument();
    });

    it('should mark notifications as done', async () => {
      const markNotificationsAsDoneMock = vi.fn();

      const props = {
        notification: mockGitifyNotification,
        account: mockGitHubCloudAccount,
      };

      renderWithAppContext(<NotificationRow {...props} />, {
        settings: mockSettings,
        markNotificationsAsDone: markNotificationsAsDoneMock,
      });

      await userEvent.click(screen.getByTestId('notification-mark-as-done'));

      expect(markNotificationsAsDoneMock).toHaveBeenCalledTimes(1);
    });

    it('should hide mark as done button when notification is already read', async () => {
      const readNotification = {
        ...mockGitifyNotification,
        unread: false,
      };

      const props = {
        notification: readNotification,
        account: mockGitHubCloudAccount,
      };

      renderWithAppContext(<NotificationRow {...props} />);

      expect(
        screen.queryByTestId('notification-mark-as-done'),
      ).not.toBeInTheDocument();
    });

    it('should show mark as done button when fetchReadNotifications is enabled and notification is unread', async () => {
      const props = {
        notification: mockGitifyNotification,
        account: mockGitHubCloudAccount,
      };

      renderWithAppContext(<NotificationRow {...props} />, {
        settings: { ...mockSettings, fetchReadNotifications: true },
      });

      expect(
        screen.getByTestId('notification-mark-as-done'),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('notification-mark-as-read'),
      ).toBeInTheDocument();
    });

    it('should unsubscribe from a notification thread', async () => {
      const unsubscribeNotificationMock = vi.fn();

      const props = {
        notification: mockGitifyNotification,
        account: mockGitHubCloudAccount,
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
