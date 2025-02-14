import { fireEvent, render, screen } from '@testing-library/react';
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
  vi.spyOn(links, 'openNotification');
  vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render itself & its children - group by date', async () => {
    vi.spyOn(global.Date, 'now').mockImplementation(() =>
      new Date('2024').valueOf(),
    );

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
    vi.spyOn(global.Date, 'now').mockImplementation(() =>
      new Date('2024').valueOf(),
    );

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
    vi.spyOn(global.Date, 'now').mockImplementation(() =>
      new Date('2024').valueOf(),
    );

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
    it('should open a notification in the browser - click', () => {
      const markNotificationsAsRead = vi.fn();

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

      fireEvent.click(screen.getByTestId('notification-row'));
      expect(links.openNotification).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsRead).toHaveBeenCalledTimes(1);
    });

    it('should open a notification in the browser - delay notification setting enabled', () => {
      const markNotificationsAsRead = vi.fn();

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

      fireEvent.click(screen.getByTestId('notification-row'));
      expect(links.openNotification).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsRead).toHaveBeenCalledTimes(1);
    });

    it('should open a notification in browser & mark it as done', () => {
      const markNotificationsAsDone = vi.fn();

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

      fireEvent.click(screen.getByTestId('notification-row'));
      expect(links.openNotification).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsDone).toHaveBeenCalledTimes(1);
    });

    it('should mark notifications as read', () => {
      const markNotificationsAsRead = vi.fn();

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

      fireEvent.click(screen.getByTestId('notification-mark-as-read'));
      expect(markNotificationsAsRead).toHaveBeenCalledTimes(1);
    });

    it('should mark notifications as done', () => {
      const markNotificationsAsDone = vi.fn();

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

      fireEvent.click(screen.getByTestId('notification-mark-as-done'));
      expect(markNotificationsAsDone).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe from a notification thread', () => {
      const unsubscribeNotification = vi.fn();

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
      fireEvent.click(
        screen.getByTestId('notification-unsubscribe-from-thread'),
      );
      expect(unsubscribeNotification).toHaveBeenCalledTimes(1);
    });
  });
});
