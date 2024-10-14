import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { mockAccountNotifications } from '../__mocks__/notifications-mocks';
import { mockAuth, mockSettings } from '../__mocks__/state-mocks';
import { AppContext } from '../context/App';
import * as comms from '../utils/comms';
import { Sidebar } from './Sidebar';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('renderer/components/Sidebar.tsx', () => {
  const fetchNotifications = jest.fn();
  const openExternalLinkMock = jest
    .spyOn(comms, 'openExternalLink')
    .mockImplementation();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render itself & its children (logged in)', () => {
    const tree = render(
      <AppContext.Provider
        value={{
          notifications: mockAccountNotifications,
          auth: mockAuth,
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

  it('should render itself & its children (logged out)', () => {
    const tree = render(
      <AppContext.Provider
        value={{
          isLoggedIn: false,
          notifications: mockAccountNotifications,
          auth: mockAuth,
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

  it('should navigate home when clicking the gitify logo', () => {
    render(
      <AppContext.Provider
        value={{
          isLoggedIn: false,
          notifications: [],
          auth: mockAuth,
          settings: mockSettings,
        }}
      >
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.click(screen.getByTestId('sidebar-home'));
    expect(mockNavigate).toHaveBeenNthCalledWith(1, '/', { replace: true });
  });

  describe('notifications icon', () => {
    it('opens notifications home when clicked', () => {
      render(
        <AppContext.Provider
          value={{
            isLoggedIn: true,
            notifications: [],
            auth: mockAuth,
            settings: mockSettings,
          }}
        >
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      fireEvent.click(screen.getByTestId('sidebar-notifications'));

      expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
      expect(openExternalLinkMock).toHaveBeenCalledWith(
        'https://github.com/notifications',
      );
    });

    it('renders correct icon when there are no notifications', () => {
      render(
        <AppContext.Provider
          value={{
            isLoggedIn: true,
            notifications: [],
            auth: mockAuth,
            settings: mockSettings,
          }}
        >
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      expect(screen.getByTestId('sidebar-notifications')).toMatchSnapshot();
    });

    it('renders correct icon when there are notifications', () => {
      render(
        <AppContext.Provider
          value={{
            isLoggedIn: true,
            notifications: [],
            auth: mockAuth,
            settings: mockSettings,
          }}
        >
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      expect(screen.getByTestId('sidebar-notifications')).toMatchSnapshot();
    });
  });

  describe('Filter notifications', () => {
    it('go to the filters route', () => {
      render(
        <AppContext.Provider
          value={{
            isLoggedIn: true,
            notifications: [],
            auth: mockAuth,
            settings: mockSettings,
          }}
        >
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      fireEvent.click(screen.getByTestId('sidebar-filter-notifications'));

      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/filters');
    });

    it('go to the home if filters path already shown', () => {
      render(
        <AppContext.Provider
          value={{
            isLoggedIn: true,
            notifications: [],
            auth: mockAuth,
            settings: mockSettings,
          }}
        >
          <MemoryRouter initialEntries={['/filters']}>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      fireEvent.click(screen.getByTestId('sidebar-filter-notifications'));

      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/', { replace: true });
    });
  });

  describe('quick links', () => {
    it('opens my github issues page', () => {
      render(
        <AppContext.Provider
          value={{
            isLoggedIn: true,
            notifications: mockAccountNotifications,
            auth: mockAuth,
            settings: mockSettings,
          }}
        >
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      fireEvent.click(screen.getByTestId('sidebar-my-issues'));

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
            auth: mockAuth,
            settings: mockSettings,
          }}
        >
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      fireEvent.click(screen.getByTestId('sidebar-my-pull-requests'));

      expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
      expect(openExternalLinkMock).toHaveBeenCalledWith(
        'https://github.com/pulls',
      );
    });
  });

  describe('Refresh Notifications', () => {
    it('should refresh the notifications when status is not loading', () => {
      render(
        <AppContext.Provider
          value={{
            isLoggedIn: true,
            notifications: [],
            auth: mockAuth,
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

      fireEvent.click(screen.getByTestId('sidebar-refresh'));

      expect(fetchNotifications).toHaveBeenCalledTimes(1);
    });

    it('should not refresh the notifications when status is loading', () => {
      render(
        <AppContext.Provider
          value={{
            isLoggedIn: true,
            notifications: [],
            auth: mockAuth,
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

      fireEvent.click(screen.getByTestId('sidebar-refresh'));

      expect(fetchNotifications).not.toHaveBeenCalled();
    });
  });

  describe('Settings', () => {
    it('go to the settings route', () => {
      render(
        <AppContext.Provider
          value={{
            isLoggedIn: true,
            notifications: [],
            auth: mockAuth,
            settings: mockSettings,
          }}
        >
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      fireEvent.click(screen.getByTestId('sidebar-settings'));

      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/settings');
    });

    it('go to the home if settings path already shown', () => {
      render(
        <AppContext.Provider
          value={{
            isLoggedIn: true,
            notifications: [],
            auth: mockAuth,
            settings: mockSettings,
            fetchNotifications,
          }}
        >
          <MemoryRouter initialEntries={['/settings']}>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      fireEvent.click(screen.getByTestId('sidebar-settings'));

      expect(fetchNotifications).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/', { replace: true });
    });
  });

  it('should quit the app', () => {
    const quitAppMock = jest.spyOn(comms, 'quitApp');

    render(
      <AppContext.Provider
        value={{
          isLoggedIn: false,
          notifications: [],
          auth: mockAuth,
          settings: mockSettings,
        }}
      >
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.click(screen.getByTestId('sidebar-quit'));

    expect(quitAppMock).toHaveBeenCalledTimes(1);
  });
});
