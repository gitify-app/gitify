import { fireEvent, render, screen } from '@testing-library/react';
import { shell } from 'electron';
import { mockAuth, mockSettings } from '../__mocks__/state-mocks';
import { AppContext } from '../context/App';
import type { UserType } from '../typesGitHub';
import { mockSingleNotification } from '../utils/api/__mocks__/response-mocks';
import * as helpers from '../utils/helpers';
import { NotificationRow } from './NotificationRow';

describe('components/NotificationRow.tsx', () => {
  beforeEach(() => {
    jest.spyOn(helpers, 'openInBrowser');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render itself & its children', async () => {
    jest
      .spyOn(global.Date, 'now')
      .mockImplementation(() => new Date('2024').valueOf());

    const props = {
      notification: mockSingleNotification,
      hostname: 'github.com',
    };

    const tree = render(<NotificationRow {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children when last_read_at is null', async () => {
    jest
      .spyOn(global.Date, 'now')
      .mockImplementation(() => new Date('2024').valueOf());

    const mockNotification = mockSingleNotification;
    mockNotification.last_read_at = null;

    const props = {
      notification: mockNotification,
      hostname: 'github.com',
    };

    const tree = render(<NotificationRow {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children without avatar', async () => {
    jest
      .spyOn(global.Date, 'now')
      .mockImplementation(() => new Date('2024').valueOf());

    const mockNotification = mockSingleNotification;
    mockNotification.subject.user = null;

    const props = {
      notification: mockNotification,
      hostname: 'github.com',
    };

    const tree = render(<NotificationRow {...props} />);
    expect(tree).toMatchSnapshot();
  });

  describe('rendering for notification comments count', () => {
    it('should render when no comments', async () => {
      jest
        .spyOn(global.Date, 'now')
        .mockImplementation(() => new Date('2024').valueOf());

      const mockNotification = mockSingleNotification;
      mockNotification.subject.comments = null;

      const props = {
        notification: mockNotification,
        hostname: 'github.com',
      };

      const tree = render(<NotificationRow {...props} />);
      expect(tree).toMatchSnapshot();
    });

    it('should render when 1 comment', async () => {
      jest
        .spyOn(global.Date, 'now')
        .mockImplementation(() => new Date('2024').valueOf());

      const mockNotification = mockSingleNotification;
      mockNotification.subject.comments = 1;

      const props = {
        notification: mockNotification,
        hostname: 'github.com',
      };

      const tree = render(<NotificationRow {...props} />);
      expect(tree).toMatchSnapshot();
    });

    it('should render when more than 1 comments', async () => {
      jest
        .spyOn(global.Date, 'now')
        .mockImplementation(() => new Date('2024').valueOf());

      const mockNotification = mockSingleNotification;
      mockNotification.subject.comments = 2;

      const props = {
        notification: mockNotification,
        hostname: 'github.com',
      };

      const tree = render(<NotificationRow {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });

  describe('notification labels', () => {
    it('should render labels metric when available', async () => {
      jest
        .spyOn(global.Date, 'now')
        .mockImplementation(() => new Date('2024').valueOf());

      const mockNotification = mockSingleNotification;
      mockNotification.subject.labels = ['enhancement', 'good-first-issue'];

      const props = {
        notification: mockNotification,
        hostname: 'github.com',
      };

      const tree = render(<NotificationRow {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });

  describe('notification interactions', () => {
    it('should open a notification in the browser - click', () => {
      const removeNotificationFromState = jest.fn();

      const props = {
        notification: mockSingleNotification,
        hostname: 'github.com',
      };

      render(
        <AppContext.Provider
          value={{
            settings: { ...mockSettings, markAsDoneOnOpen: false },
            removeNotificationFromState,
            auth: mockAuth,
          }}
        >
          <NotificationRow {...props} />
        </AppContext.Provider>,
      );

      fireEvent.click(screen.getByRole('main'));
      expect(helpers.openInBrowser).toHaveBeenCalledTimes(1);
      expect(removeNotificationFromState).toHaveBeenCalledTimes(1);
    });

    it('should open a notification in the browser - key down', () => {
      const removeNotificationFromState = jest.fn();

      const props = {
        notification: mockSingleNotification,
        hostname: 'github.com',
      };

      render(
        <AppContext.Provider
          value={{
            settings: { ...mockSettings, markAsDoneOnOpen: false },
            removeNotificationFromState,
            auth: mockAuth,
          }}
        >
          <NotificationRow {...props} />
        </AppContext.Provider>,
      );

      fireEvent.keyDown(screen.getByRole('main'));
      expect(helpers.openInBrowser).toHaveBeenCalledTimes(1);
      expect(removeNotificationFromState).toHaveBeenCalledTimes(1);
    });

    it('should open a notification in browser & mark it as done', () => {
      const markNotificationDone = jest.fn();

      const props = {
        notification: mockSingleNotification,
        hostname: 'github.com',
      };

      render(
        <AppContext.Provider
          value={{
            settings: { ...mockSettings, markAsDoneOnOpen: true },
            markNotificationDone,
            auth: mockAuth,
          }}
        >
          <NotificationRow {...props} />
        </AppContext.Provider>,
      );

      fireEvent.click(screen.getByRole('main'));
      expect(helpers.openInBrowser).toHaveBeenCalledTimes(1);
      expect(markNotificationDone).toHaveBeenCalledTimes(1);
    });

    it('should mark a notification as read', () => {
      const markNotificationRead = jest.fn();

      const props = {
        notification: mockSingleNotification,
        hostname: 'github.com',
      };

      render(
        <AppContext.Provider
          value={{
            settings: { ...mockSettings, markAsDoneOnOpen: false },
            auth: mockAuth,
          }}
        >
          <AppContext.Provider value={{ markNotificationRead }}>
            <NotificationRow {...props} />
          </AppContext.Provider>
        </AppContext.Provider>,
      );

      fireEvent.click(screen.getByTitle('Mark as Read'));
      expect(markNotificationRead).toHaveBeenCalledTimes(1);
    });

    it('should mark a notification as done', () => {
      const markNotificationDone = jest.fn();

      const props = {
        notification: mockSingleNotification,
        hostname: 'github.com',
      };

      render(
        <AppContext.Provider
          value={{
            settings: { ...mockSettings },
            auth: mockAuth,
          }}
        >
          <AppContext.Provider value={{ markNotificationDone }}>
            <NotificationRow {...props} />
          </AppContext.Provider>
        </AppContext.Provider>,
      );

      fireEvent.click(screen.getByTitle('Mark as Done'));
      expect(markNotificationDone).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe from a notification thread', () => {
      const unsubscribeNotification = jest.fn();

      const props = {
        notification: mockSingleNotification,
        hostname: 'github.com',
      };

      render(
        <AppContext.Provider value={{}}>
          <AppContext.Provider value={{ unsubscribeNotification }}>
            <NotificationRow {...props} />
          </AppContext.Provider>
        </AppContext.Provider>,
      );
      fireEvent.click(screen.getByTitle('Unsubscribe from Thread'));
      expect(unsubscribeNotification).toHaveBeenCalledTimes(1);
    });

    it('should open notification user profile', () => {
      const props = {
        notification: {
          ...mockSingleNotification,
          subject: {
            ...mockSingleNotification.subject,
            user: {
              login: 'some-user',
              html_url: 'https://github.com/some-user',
              avatar_url:
                'https://avatars.githubusercontent.com/u/123456789?v=4',
              type: 'User' as UserType,
            },
            reviews: null,
          },
        },
        hostname: 'github.com',
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
      expect(shell.openExternal).toHaveBeenCalledTimes(1);
      expect(shell.openExternal).toHaveBeenCalledWith(
        props.notification.subject.user.html_url,
      );
    });
  });
});
