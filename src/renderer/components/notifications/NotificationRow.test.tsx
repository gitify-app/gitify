import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';
import { GroupBy } from '../../types';
import { mockSingleNotification } from '../../utils/api/__mocks__/response-mocks';
import * as comms from '../../utils/comms';
import * as links from '../../utils/links';
import { NotificationRow } from './NotificationRow';

describe('renderer/components/notifications/NotificationRow.tsx', () => {
  jest.spyOn(links, 'openNotification').mockImplementation();
  jest.spyOn(comms, 'openExternalLink').mockImplementation();
  jest
    .spyOn(globalThis.Date, 'now')
    .mockImplementation(() => new Date('2024').valueOf());

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render itself & its children - group by date', async () => {
    const props = {
      notification: mockSingleNotification,
      account: mockGitHubCloudAccount,
    };

    const tree = renderWithAppContext(<NotificationRow {...props} />, {
      settings: { ...mockSettings, groupBy: GroupBy.DATE },
    });

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - group by repositories', async () => {
    const props = {
      notification: mockSingleNotification,
      account: mockGitHubCloudAccount,
    };

    const tree = renderWithAppContext(<NotificationRow {...props} />, {
      settings: { ...mockSettings, groupBy: GroupBy.REPOSITORY },
    });

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - hide numbers', async () => {
    const props = {
      notification: mockSingleNotification,
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
        ...mockSingleNotification,
        unread: false,
      },
      account: mockGitHubCloudAccount,
    };

    const tree = renderWithAppContext(<NotificationRow {...props} />);

    expect(tree).toMatchSnapshot();
  });

  describe('notification interactions', () => {
    it('should open a notification in the browser - click', async () => {
      const markNotificationsAsReadMock = jest.fn();

      const props = {
        notification: mockSingleNotification,
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
      const markNotificationsAsReadMock = jest.fn();

      const props = {
        notification: mockSingleNotification,
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
      const markNotificationsAsDoneMock = jest.fn();

      const props = {
        notification: mockSingleNotification,
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

    it('should mark notifications as read', async () => {
      const markNotificationsAsReadMock = jest.fn();

      const props = {
        notification: mockSingleNotification,
        account: mockGitHubCloudAccount,
      };

      renderWithAppContext(<NotificationRow {...props} />, {
        settings: { ...mockSettings, markAsDoneOnOpen: false },
        markNotificationsAsRead: markNotificationsAsReadMock,
      });

      await userEvent.click(screen.getByTestId('notification-mark-as-read'));

      expect(markNotificationsAsReadMock).toHaveBeenCalledTimes(1);
    });

    it('should mark notifications as done', async () => {
      const markNotificationsAsDoneMock = jest.fn();

      const props = {
        notification: mockSingleNotification,
        account: mockGitHubCloudAccount,
      };

      renderWithAppContext(<NotificationRow {...props} />, {
        settings: mockSettings,
        markNotificationsAsDone: markNotificationsAsDoneMock,
      });

      await userEvent.click(screen.getByTestId('notification-mark-as-done'));

      expect(markNotificationsAsDoneMock).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe from a notification thread', async () => {
      const unsubscribeNotificationMock = jest.fn();

      const props = {
        notification: mockSingleNotification,
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
