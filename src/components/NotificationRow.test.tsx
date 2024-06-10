import { fireEvent, render, screen } from '@testing-library/react';
import { mockAuth, mockSettings } from '../__mocks__/state-mocks';
import { AppContext } from '../context/App';
import type { Milestone, UserType } from '../typesGitHub';
import { mockSingleNotification } from '../utils/api/__mocks__/response-mocks';
import * as comms from '../utils/comms';
import * as links from '../utils/links';
import { NotificationRow } from './NotificationRow';

describe('components/NotificationRow.tsx', () => {
  beforeEach(() => {
    jest.spyOn(links, 'openNotification');
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

    const tree = render(
      <AppContext.Provider value={{ settings: mockSettings }}>
        <NotificationRow {...props} />
      </AppContext.Provider>,
    );
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

    const tree = render(
      <AppContext.Provider value={{ settings: mockSettings }}>
        <NotificationRow {...props} />
      </AppContext.Provider>,
    );
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

    const tree = render(
      <AppContext.Provider value={{ settings: mockSettings }}>
        <NotificationRow {...props} />
      </AppContext.Provider>,
    );
    expect(tree).toMatchSnapshot();
  });

  describe('notification pills / metrics', () => {
    describe('showPills disabled', () => {
      it('should not render any pills when showPills is disabled', async () => {
        jest
          .spyOn(global.Date, 'now')
          .mockImplementation(() => new Date('2024').valueOf());

        const mockNotification = mockSingleNotification;
        mockNotification.subject.linkedIssues = ['#1'];

        const props = {
          notification: mockNotification,
          hostname: 'github.com',
        };

        const tree = render(
          <AppContext.Provider
            value={{
              settings: { ...mockSettings, showPills: false },
            }}
          >
            <NotificationRow {...props} />
          </AppContext.Provider>,
        );
        expect(tree).toMatchSnapshot();
      });
    });

    describe('linked issue pills', () => {
      it('should render issues pill when linked to one issue/pr', async () => {
        jest
          .spyOn(global.Date, 'now')
          .mockImplementation(() => new Date('2024').valueOf());

        const mockNotification = mockSingleNotification;
        mockNotification.subject.linkedIssues = ['#1'];

        const props = {
          notification: mockNotification,
          hostname: 'github.com',
        };

        const tree = render(
          <AppContext.Provider
            value={{
              settings: mockSettings,
            }}
          >
            <NotificationRow {...props} />
          </AppContext.Provider>,
        );
        expect(tree).toMatchSnapshot();
      });

      it('should render issues pill when linked to multiple issues/prs', async () => {
        jest
          .spyOn(global.Date, 'now')
          .mockImplementation(() => new Date('2024').valueOf());

        const mockNotification = mockSingleNotification;
        mockNotification.subject.linkedIssues = ['#1', '#2'];

        const props = {
          notification: mockNotification,
          hostname: 'github.com',
        };

        const tree = render(
          <AppContext.Provider
            value={{
              settings: mockSettings,
            }}
          >
            <NotificationRow {...props} />
          </AppContext.Provider>,
        );
        expect(tree).toMatchSnapshot();
      });
    });

    describe('comment pills', () => {
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

        const tree = render(
          <AppContext.Provider
            value={{
              settings: mockSettings,
            }}
          >
            <NotificationRow {...props} />
          </AppContext.Provider>,
        );
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

        const tree = render(
          <AppContext.Provider
            value={{
              settings: mockSettings,
            }}
          >
            <NotificationRow {...props} />
          </AppContext.Provider>,
        );
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

        const tree = render(
          <AppContext.Provider
            value={{
              settings: mockSettings,
            }}
          >
            <NotificationRow {...props} />
          </AppContext.Provider>,
        );
        expect(tree).toMatchSnapshot();
      });
    });

    describe('label pills', () => {
      it('should render labels pill', async () => {
        jest
          .spyOn(global.Date, 'now')
          .mockImplementation(() => new Date('2024').valueOf());

        const mockNotification = mockSingleNotification;
        mockNotification.subject.labels = ['enhancement', 'good-first-issue'];

        const props = {
          notification: mockNotification,
          hostname: 'github.com',
        };

        const tree = render(
          <AppContext.Provider
            value={{
              settings: mockSettings,
            }}
          >
            <NotificationRow {...props} />
          </AppContext.Provider>,
        );
        expect(tree).toMatchSnapshot();
      });
    });

    describe('milestone pills', () => {
      it('should render open milestone pill', async () => {
        jest
          .spyOn(global.Date, 'now')
          .mockImplementation(() => new Date('2024').valueOf());

        const mockNotification = mockSingleNotification;
        mockNotification.subject.milestone = {
          title: 'Milestone 1',
          state: 'open',
        } as Milestone;

        const props = {
          notification: mockNotification,
          hostname: 'github.com',
        };

        const tree = render(
          <AppContext.Provider
            value={{
              settings: mockSettings,
            }}
          >
            <NotificationRow {...props} />
          </AppContext.Provider>,
        );
        expect(tree).toMatchSnapshot();
      });

      it('should render closed milestone pill', async () => {
        jest
          .spyOn(global.Date, 'now')
          .mockImplementation(() => new Date('2024').valueOf());

        const mockNotification = mockSingleNotification;
        mockNotification.subject.milestone = {
          title: 'Milestone 1',
          state: 'closed',
        } as Milestone;

        const props = {
          notification: mockNotification,
          hostname: 'github.com',
        };

        const tree = render(
          <AppContext.Provider
            value={{
              settings: mockSettings,
            }}
          >
            <NotificationRow {...props} />
          </AppContext.Provider>,
        );
        expect(tree).toMatchSnapshot();
      });
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
      expect(links.openNotification).toHaveBeenCalledTimes(1);
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
      expect(links.openNotification).toHaveBeenCalledTimes(1);
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
      expect(links.openNotification).toHaveBeenCalledTimes(1);
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
            markNotificationRead,
          }}
        >
          <NotificationRow {...props} />
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
          value={{ settings: mockSettings, markNotificationDone }}
        >
          <NotificationRow {...props} />
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
      expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
      expect(openExternalLinkMock).toHaveBeenCalledWith(
        props.notification.subject.user.html_url,
      );
    });
  });
});
