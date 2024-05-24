import { fireEvent, render, screen } from '@testing-library/react';

import * as TestRenderer from 'react-test-renderer';

import * as helpers from '../utils/helpers';

import { shell } from 'electron';
import { mockAuth, mockSettings } from '../__mocks__/mock-state';
import { mockedSingleNotification } from '../__mocks__/mockedData';
import { AppContext } from '../context/App';
import type { UserType } from '../typesGitHub';
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
      notification: mockedSingleNotification,
      hostname: 'github.com',
    };

    const tree = TestRenderer.create(<NotificationRow {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children when last_read_at is null', async () => {
    jest
      .spyOn(global.Date, 'now')
      .mockImplementation(() => new Date('2024').valueOf());

    const mockNotification = mockedSingleNotification;
    mockNotification.last_read_at = null;

    const props = {
      notification: mockNotification,
      hostname: 'github.com',
    };

    const tree = TestRenderer.create(<NotificationRow {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children without avatar', async () => {
    jest
      .spyOn(global.Date, 'now')
      .mockImplementation(() => new Date('2024').valueOf());

    const mockNotification = mockedSingleNotification;
    mockNotification.subject.user = null;

    const props = {
      notification: mockNotification,
      hostname: 'github.com',
    };

    const tree = TestRenderer.create(<NotificationRow {...props} />);
    expect(tree).toMatchSnapshot();
  });

  describe('rendering for notification comments count', () => {
    it('should render when no comments', async () => {
      jest
        .spyOn(global.Date, 'now')
        .mockImplementation(() => new Date('2024').valueOf());

      const mockNotification = mockedSingleNotification;
      mockNotification.subject.comments = null;

      const props = {
        notification: mockNotification,
        hostname: 'github.com',
      };

      const tree = TestRenderer.create(<NotificationRow {...props} />);
      expect(tree).toMatchSnapshot();
    });

    it('should render when 1 comment', async () => {
      jest
        .spyOn(global.Date, 'now')
        .mockImplementation(() => new Date('2024').valueOf());

      const mockNotification = mockedSingleNotification;
      mockNotification.subject.comments = 1;

      const props = {
        notification: mockNotification,
        hostname: 'github.com',
      };

      const tree = TestRenderer.create(<NotificationRow {...props} />);
      expect(tree).toMatchSnapshot();
    });

    it('should render when more than 1 comments', async () => {
      jest
        .spyOn(global.Date, 'now')
        .mockImplementation(() => new Date('2024').valueOf());

      const mockNotification = mockedSingleNotification;
      mockNotification.subject.comments = 2;

      const props = {
        notification: mockNotification,
        hostname: 'github.com',
      };

      const tree = TestRenderer.create(<NotificationRow {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });

  describe('notification interactions', () => {
    it('should open a notification in the browser - click', () => {
      const removeNotificationFromState = jest.fn();

      const props = {
        notification: mockedSingleNotification,
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
        notification: mockedSingleNotification,
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
        notification: mockedSingleNotification,
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
        notification: mockedSingleNotification,
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
        notification: mockedSingleNotification,
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
        notification: mockedSingleNotification,
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
          ...mockedSingleNotification,
          subject: {
            ...mockedSingleNotification.subject,
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
