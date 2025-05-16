import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  mockAuth,
  mockGitHubCloudAccount,
  mockSettings,
} from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
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
      .spyOn(global.Date, 'now')
      .mockImplementation(() => new Date('2024').valueOf());

    const props = {
      notification: mockSingleNotification,
      account: mockGitHubCloudAccount,
    };

    const tree = render(
      <AppContext.Provider
        value={{ settings: { ...mockSettings, groupBy: GroupBy.DATE } }}
      >
        <NotificationRow {...props} />
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - group by repositories', async () => {
    jest
      .spyOn(global.Date, 'now')
      .mockImplementation(() => new Date('2024').valueOf());

    const props = {
      notification: mockSingleNotification,
      account: mockGitHubCloudAccount,
    };

    const tree = render(
      <AppContext.Provider
        value={{ settings: { ...mockSettings, groupBy: GroupBy.REPOSITORY } }}
      >
        <NotificationRow {...props} />
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - hide numbers', async () => {
    jest
      .spyOn(global.Date, 'now')
      .mockImplementation(() => new Date('2024').valueOf());

    const props = {
      notification: mockSingleNotification,
      account: mockGitHubCloudAccount,
    };

    const tree = render(
      <AppContext.Provider
        value={{ settings: { ...mockSettings, showNumber: false } }}
      >
        <NotificationRow {...props} />
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  describe('notification interactions', () => {
    it('should open a notification in the browser - click', async () => {
      const markNotificationsAsRead = jest.fn();

      const props = {
        notification: mockSingleNotification,
        account: mockGitHubCloudAccount,
      };

      render(
        <AppContext.Provider
          value={{
            settings: { ...mockSettings, markAsDoneOnOpen: false },
            markNotificationsAsRead,
            auth: mockAuth,
          }}
        >
          <NotificationRow {...props} />
        </AppContext.Provider>,
      );

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

      render(
        <AppContext.Provider
          value={{
            settings: {
              ...mockSettings,
              markAsDoneOnOpen: false,
              delayNotificationState: true,
            },
            markNotificationsAsRead,
            auth: mockAuth,
          }}
        >
          <NotificationRow {...props} />
        </AppContext.Provider>,
      );

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

      render(
        <AppContext.Provider
          value={{
            settings: { ...mockSettings, markAsDoneOnOpen: true },
            markNotificationsAsDone,
            auth: mockAuth,
          }}
        >
          <NotificationRow {...props} />
        </AppContext.Provider>,
      );

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

      render(
        <AppContext.Provider
          value={{
            settings: { ...mockSettings, markAsDoneOnOpen: false },
            markNotificationsAsRead,
          }}
        >
          <NotificationRow {...props} />
        </AppContext.Provider>,
      );

      await userEvent.click(screen.getByTestId('notification-mark-as-read'));

      expect(markNotificationsAsRead).toHaveBeenCalledTimes(1);
    });

    it('should mark notifications as done', async () => {
      const markNotificationsAsDone = jest.fn();

      const props = {
        notification: mockSingleNotification,
        account: mockGitHubCloudAccount,
      };

      render(
        <AppContext.Provider
          value={{ settings: mockSettings, markNotificationsAsDone }}
        >
          <NotificationRow {...props} />
        </AppContext.Provider>,
      );

      await userEvent.click(screen.getByTestId('notification-mark-as-done'));

      expect(markNotificationsAsDone).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe from a notification thread', async () => {
      const unsubscribeNotification = jest.fn();

      const props = {
        notification: mockSingleNotification,
        account: mockGitHubCloudAccount,
      };

      render(
        <AppContext.Provider value={{}}>
          <AppContext.Provider
            value={{ settings: mockSettings, unsubscribeNotification }}
          >
            <NotificationRow {...props} />
          </AppContext.Provider>
        </AppContext.Provider>,
      );

      await userEvent.click(
        screen.getByTestId('notification-unsubscribe-from-thread'),
      );

      expect(unsubscribeNotification).toHaveBeenCalledTimes(1);
    });
  });
});
