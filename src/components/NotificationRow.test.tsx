import { fireEvent, render, screen } from '@testing-library/react';
import {
  mockAuth,
  mockGitHubCloudAccount,
  mockSettings,
} from '../__mocks__/state-mocks';
import { AppContext } from '../context/App';
import { GroupBy, type Link } from '../types';
import type { UserType } from '../typesGitHub';
import { mockSingleNotification } from '../utils/api/__mocks__/response-mocks';
import * as comms from '../utils/comms';
import * as links from '../utils/links';
import { NotificationRow } from './NotificationRow';

describe('components/NotificationRow.tsx', () => {
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
    it('should open a notification in the browser - click', () => {
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

      fireEvent.click(screen.getByRole('main'));
      expect(links.openNotification).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsRead).toHaveBeenCalledTimes(1);
    });

    it('should open a notification in the browser - delay notification setting enabled', () => {
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

      fireEvent.click(screen.getByRole('main'));
      expect(links.openNotification).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsRead).toHaveBeenCalledTimes(1);
    });

    it('should open a notification in the browser - key down', () => {
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

      fireEvent.click(screen.getByRole('main'));
      expect(links.openNotification).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsRead).toHaveBeenCalledTimes(1);
    });

    it('should open a notification in browser & mark it as done', () => {
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

      fireEvent.click(screen.getByRole('main'));
      expect(links.openNotification).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsDone).toHaveBeenCalledTimes(1);
    });

    it('should mark a notification as read', () => {
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

      fireEvent.click(screen.getByTitle('Mark as Read'));
      expect(markNotificationsAsRead).toHaveBeenCalledTimes(1);
    });

    it('should mark a notification as done', () => {
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

      fireEvent.click(screen.getByTitle('Mark as Done'));
      expect(markNotificationsAsDone).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe from a notification thread', () => {
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
      fireEvent.click(screen.getByTitle('Unsubscribe from Thread'));
      expect(unsubscribeNotification).toHaveBeenCalledTimes(1);
    });

    it('should open notification user profile', () => {
      const openExternalLinkMock = jest.spyOn(comms, 'openExternalLink');

      const props = {
        notification: {
          ...mockSingleNotification,
          subject: {
            ...mockSingleNotification.subject,
            user: {
              login: 'some-user',
              html_url: 'https://github.com/some-user' as Link,
              avatar_url:
                'https://avatars.githubusercontent.com/u/123456789?v=4' as Link,
              type: 'User' as UserType,
            },
            reviews: null,
          },
        },
        account: mockGitHubCloudAccount,
      };

      render(
        <AppContext.Provider
          value={{
            settings: { ...mockSettings },
            auth: mockAuth,
          }}
        >
          <NotificationRow {...props} />
        </AppContext.Provider>,
      );

      fireEvent.click(screen.getByTitle('View User Profile'));
      expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
      expect(openExternalLinkMock).toHaveBeenCalledWith(
        props.notification.subject.user.html_url,
      );
    });
  });
});
