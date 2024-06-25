import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { mockAccountNotifications } from '../__mocks__/notifications-mocks';
import { mockSettings } from '../__mocks__/state-mocks';
import { AppContext } from '../context/App';
import { IconColor } from '../types';
import * as comms from '../utils/comms';
import { Sidebar } from './Sidebar';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('components/Sidebar.tsx', () => {
  const fetchNotifications = jest.fn();

  const openExternalLinkMock = jest.spyOn(comms, 'openExternalLink');

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render itself & its children (logged in)', () => {
    const tree = render(
      <AppContext.Provider
        value={{
          settings: mockSettings,
          notifications: mockAccountNotifications,
        }}
      >
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children (logged out)', () => {
    const tree = render(
      <AppContext.Provider
        value={{
          isLoggedIn: false,
          notifications: mockAccountNotifications,
          settings: mockSettings,
        }}
      >
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should open the gitify repository', () => {
    render(
      <AppContext.Provider
        value={{ isLoggedIn: false, notifications: [], settings: mockSettings }}
      >
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.click(screen.getByTestId('gitify-logo'));

    expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
    expect(openExternalLinkMock).toHaveBeenCalledWith(
      'https://github.com/gitify-app/gitify',
    );
  });

  describe('quick links', () => {
    describe('notifications icon', () => {
      it('when there are 0 notifications', () => {
        render(
          <AppContext.Provider
            value={{
              isLoggedIn: true,
              notifications: [],
              settings: mockSettings,
            }}
          >
            <MemoryRouter>
              <Sidebar />
            </MemoryRouter>
          </AppContext.Provider>,
        );

        const notificationsIcon = screen.getByTitle('0 Unread Notifications');

        expect(notificationsIcon.className).toContain('text-white');
        expect(notificationsIcon.childNodes.length).toBe(1);
        expect(notificationsIcon.childNodes[0].nodeName).toBe('svg');

        fireEvent.click(screen.getByLabelText('0 Unread Notifications'));

        expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
        expect(openExternalLinkMock).toHaveBeenCalledWith(
          'https://github.com/notifications',
        );
      });

      it('when there are more than 0 notifications', () => {
        render(
          <AppContext.Provider
            value={{
              isLoggedIn: true,
              notifications: mockAccountNotifications,
              settings: mockSettings,
            }}
          >
            <MemoryRouter>
              <Sidebar />
            </MemoryRouter>
          </AppContext.Provider>,
        );

        const notificationsIcon = screen.getByTitle('4 Unread Notifications');

        expect(notificationsIcon.className).toContain(IconColor.GREEN);
        expect(notificationsIcon.childNodes.length).toBe(2);
        expect(notificationsIcon.childNodes[0].nodeName).toBe('svg');
        expect(notificationsIcon.childNodes[1].nodeValue).toBe('4');

        fireEvent.click(screen.getByLabelText('4 Unread Notifications'));

        expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
        expect(openExternalLinkMock).toHaveBeenCalledWith(
          'https://github.com/notifications',
        );
      });
    });
  });

  it('opens my github issues page', () => {
    render(
      <AppContext.Provider
        value={{
          isLoggedIn: true,
          notifications: mockAccountNotifications,
          settings: mockSettings,
        }}
      >
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.click(screen.getByLabelText('My Issues'));

    expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
    expect(openExternalLinkMock).toHaveBeenCalledWith(
      'https://github.com/issues',
    );
  });

  it('opens my github pull requests page', () => {
    render(
      <AppContext.Provider
        value={{
          isLoggedIn: true,
          notifications: mockAccountNotifications,
          settings: mockSettings,
        }}
      >
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.click(screen.getByLabelText('My Pull Requests'));

    expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
    expect(openExternalLinkMock).toHaveBeenCalledWith(
      'https://github.com/pulls',
    );
  });

  describe('Refresh Notifications', () => {
    it('should refresh the notifications when status is not loading', () => {
      render(
        <AppContext.Provider
          value={{
            isLoggedIn: true,
            notifications: [],
            settings: mockSettings,
            fetchNotifications,
            status: 'success',
          }}
        >
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      fireEvent.click(screen.getByTitle('Refresh Notifications'));

      expect(fetchNotifications).toHaveBeenCalledTimes(1);
    });

    it('should not refresh the notifications when status is loading', () => {
      render(
        <AppContext.Provider
          value={{
            isLoggedIn: true,
            notifications: [],
            settings: mockSettings,
            fetchNotifications,
            status: 'loading',
          }}
        >
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      fireEvent.click(screen.getByTitle('Refresh Notifications'));

      expect(fetchNotifications).not.toHaveBeenCalled();
    });
  });

  describe('Filters', () => {
    it('go to the filters route', () => {
      render(
        <AppContext.Provider
          value={{
            isLoggedIn: true,
            notifications: [],
            settings: mockSettings,
          }}
        >
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>,
      );
      fireEvent.click(screen.getByTitle('Filters'));
      expect(mockNavigate).toHaveBeenCalledWith('/filters');
    });

    it('go to the home if filters path already shown', () => {
      render(
        <AppContext.Provider
          value={{
            isLoggedIn: true,
            notifications: [],
            settings: mockSettings,
          }}
        >
          <MemoryRouter initialEntries={['/filters']}>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>,
      );
      fireEvent.click(screen.getByTitle('Filters'));
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  describe('Settings', () => {
    it('go to the settings route', () => {
      render(
        <AppContext.Provider
          value={{
            isLoggedIn: true,
            notifications: [],
            settings: mockSettings,
          }}
        >
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      fireEvent.click(screen.getByTitle('Settings'));

      expect(mockNavigate).toHaveBeenCalledWith('/settings');
    });

    it('go to the home if settings path already shown', () => {
      render(
        <AppContext.Provider
          value={{
            isLoggedIn: true,
            notifications: [],
            settings: mockSettings,
            fetchNotifications,
          }}
        >
          <MemoryRouter initialEntries={['/settings']}>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      fireEvent.click(screen.getByTitle('Settings'));

      expect(fetchNotifications).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('opens github in the notifications page', () => {
    const openExternalLinkMock = jest.spyOn(comms, 'openExternalLink');

    render(
      <AppContext.Provider
        value={{
          isLoggedIn: true,
          notifications: mockAccountNotifications,
          settings: mockSettings,
        }}
      >
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>,
    );
    fireEvent.click(screen.getByLabelText('4 Unread Notifications'));
    expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
    expect(openExternalLinkMock).toHaveBeenCalledWith(
      'https://github.com/notifications',
    );
  });

  it('opens my github issues page', () => {
    const openExternalLinkMock = jest.spyOn(comms, 'openExternalLink');

    render(
      <AppContext.Provider
        value={{
          isLoggedIn: true,
          notifications: mockAccountNotifications,
          settings: mockSettings,
        }}
      >
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>,
    );
    fireEvent.click(screen.getByLabelText('My Issues'));
    expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
    expect(openExternalLinkMock).toHaveBeenCalledWith(
      'https://github.com/issues',
    );
  });

  it('opens my github pull requests page', () => {
    const openExternalLinkMock = jest.spyOn(comms, 'openExternalLink');

    render(
      <AppContext.Provider
        value={{
          isLoggedIn: true,
          notifications: mockAccountNotifications,
          settings: mockSettings,
        }}
      >
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>,
    );
    fireEvent.click(screen.getByLabelText('My Pull Requests'));
    expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
    expect(openExternalLinkMock).toHaveBeenCalledWith(
      'https://github.com/pulls',
    );
  });

  it('should quit the app', () => {
    const quitAppMock = jest.spyOn(comms, 'quitApp');

    render(
      <AppContext.Provider
        value={{ isLoggedIn: false, notifications: [], settings: mockSettings }}
      >
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.click(screen.getByTitle('Quit Gitify'));

    expect(quitAppMock).toHaveBeenCalledTimes(1);
  });

  it('should open the gitify repository', () => {
    const openExternalLinkMock = jest.spyOn(comms, 'openExternalLink');

    render(
      <AppContext.Provider
        value={{ isLoggedIn: false, notifications: [], settings: mockSettings }}
      >
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>,
    );
    fireEvent.click(screen.getByTestId('gitify-logo'));
    expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
    expect(openExternalLinkMock).toHaveBeenCalledWith(
      'https://github.com/gitify-app/gitify',
    );
  });

  describe('should render the notifications icon', () => {
    it('when there are 0 notifications', () => {
      render(
        <AppContext.Provider
          value={{
            isLoggedIn: true,
            notifications: [],
            settings: mockSettings,
          }}
        >
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      const notificationsIcon = screen.getByTitle('0 Unread Notifications');
      expect(notificationsIcon.className).toContain('text-white');
      expect(notificationsIcon.childNodes.length).toBe(1);
      expect(notificationsIcon.childNodes[0].nodeName).toBe('svg');
    });

    it('when there are more than 0 notifications', () => {
      render(
        <AppContext.Provider
          value={{
            isLoggedIn: true,
            notifications: mockAccountNotifications,
            settings: mockSettings,
          }}
        >
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      const notificationsIcon = screen.getByTitle('4 Unread Notifications');
      expect(notificationsIcon.className).toContain(IconColor.GREEN);
      expect(notificationsIcon.childNodes.length).toBe(2);
      expect(notificationsIcon.childNodes[0].nodeName).toBe('svg');
      expect(notificationsIcon.childNodes[1].nodeValue).toBe('4');
    });
  });
});
