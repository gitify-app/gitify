import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import {
  mockAuth,
  mockGitHubCloudAccount,
  mockSettings,
} from '../../__mocks__/state-mocks';
import { GroupBy } from '../../types';
import { mockSingleNotification } from '../../utils/api/__mocks__/response-mocks';
import * as comms from '../../utils/comms';
import * as links from '../../utils/links';
import { NotificationRow } from './NotificationRow';

describe('renderer/components/notifications/NotificationRow.tsx', () => {
  jest.spyOn(links, 'openNotification');
  jest.spyOn(comms, 'openExternalLink').mockImplementation();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render itself & its children - group by date', async () => {
    jest
      .spyOn(globalThis.Date, 'now')
      .mockImplementation(() => new Date('2024').valueOf());

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
    jest
      .spyOn(globalThis.Date, 'now')
      .mockImplementation(() => new Date('2024').valueOf());

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
    jest
      .spyOn(globalThis.Date, 'now')
      .mockImplementation(() => new Date('2024').valueOf());

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
    jest
      .spyOn(global.Date, 'now')
      .mockImplementation(() => new Date('2024').valueOf());

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
      const markNotificationsAsRead = jest.fn();

      const props = {
        notification: mockSingleNotification,
        account: mockGitHubCloudAccount,
      };

      renderWithAppContext(<NotificationRow {...props} />, {
        settings: { ...mockSettings, markAsDoneOnOpen: false },
        markNotificationsAsRead,
      });

      await userEvent.click(screen.getByTestId('notification-row'));

      expect(links.openNotification).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsRead).toHaveBeenCalledTimes(1);
    });

    it('should open a notification in the browser - delay notification setting enabled', async () => {
      const markNotificationsAsRead = jest.fn();

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
        markNotificationsAsRead,
      });

      await userEvent.click(screen.getByTestId('notification-row'));

      expect(links.openNotification).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsRead).toHaveBeenCalledTimes(1);
    });

    it('should open a notification in browser & mark it as done', async () => {
      const markNotificationsAsDone = jest.fn();

      const props = {
        notification: mockSingleNotification,
        account: mockGitHubCloudAccount,
      };

      renderWithAppContext(<NotificationRow {...props} />, {
        settings: { ...mockSettings, markAsDoneOnOpen: true },
        markNotificationsAsDone,
      });

      await userEvent.click(screen.getByTestId('notification-row'));

      expect(links.openNotification).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsDone).toHaveBeenCalledTimes(1);
    });

    it('should mark notifications as read', async () => {
      const markNotificationsAsRead = jest.fn();

      const props = {
        notification: mockSingleNotification,
        account: mockGitHubCloudAccount,
      };

      renderWithAppContext(<NotificationRow {...props} />, {
        settings: { ...mockSettings, markAsDoneOnOpen: false },
        markNotificationsAsRead,
      });

      await userEvent.click(screen.getByTestId('notification-mark-as-read'));

      expect(markNotificationsAsRead).toHaveBeenCalledTimes(1);
    });

    it('should mark notifications as done', async () => {
      const markNotificationsAsDone = jest.fn();

      const props = {
        notification: mockSingleNotification,
        account: mockGitHubCloudAccount,
      };

      renderWithAppContext(<NotificationRow {...props} />, {
        settings: mockSettings,
        markNotificationsAsDone,
      });

      await userEvent.click(screen.getByTestId('notification-mark-as-done'));

      expect(markNotificationsAsDone).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe from a notification thread', async () => {
      const unsubscribeNotification = jest.fn();

      const props = {
        notification: mockSingleNotification,
        account: mockGitHubCloudAccount,
      };

      renderWithAppContext(<NotificationRow {...props} />, {
        settings: mockSettings,
        unsubscribeNotification,
      });

      await userEvent.click(
        screen.getByTestId('notification-unsubscribe-from-thread'),
      );

      expect(unsubscribeNotification).toHaveBeenCalledTimes(1);
    });
  });
});
