import { fireEvent, render, screen } from '@testing-library/react';
import { ipcRenderer, shell } from 'electron';
import { MemoryRouter } from 'react-router-dom';
import { mockAccountNotifications } from '../__mocks__/notifications-mocks';
import { mockSettings } from '../__mocks__/state-mocks';
import { AppContext } from '../context/App';
import { Sidebar } from './Sidebar';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('components/Sidebar.tsx', () => {
  const fetchNotifications = jest.fn();

  beforeEach(() => {
    fetchNotifications.mockReset();

    jest.spyOn(ipcRenderer, 'send');
    jest.spyOn(shell, 'openExternal');
    jest.spyOn(window, 'clearInterval');
  });

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
        value={{ isLoggedIn: false, notifications: mockAccountNotifications }}
      >
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>,
    );
    expect(tree).toMatchSnapshot();
  });

  describe('Refresh Notifications', () => {
    it('should refresh the notifications when status is not loading', () => {
      render(
        <AppContext.Provider
          value={{
            isLoggedIn: true,
            notifications: [],
            fetchNotifications,
            status: 'success',
          }}
        >
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>,
      );
      fetchNotifications.mockReset();
      fireEvent.click(screen.getByTitle('Refresh Notifications'));

      expect(fetchNotifications).toHaveBeenCalledTimes(1);
    });

    it('should not refresh the notifications when status is loading', () => {
      render(
        <AppContext.Provider
          value={{
            isLoggedIn: true,
            notifications: [],
            fetchNotifications,
            status: 'loading',
          }}
        >
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>,
      );
      fetchNotifications.mockReset();
      fireEvent.click(screen.getByTitle('Refresh Notifications'));

      expect(fetchNotifications).not.toHaveBeenCalled();
    });
  });

  describe('Accounts', () => {
    it('go to the accounts route', () => {
      render(
        <AppContext.Provider value={{ isLoggedIn: true, notifications: [] }}>
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>,
      );
      fireEvent.click(screen.getByTitle('Accounts'));
      expect(mockNavigate).toHaveBeenCalledWith('/accounts');
    });

    it('go to the home if accounts path already shown', () => {
      render(
        <AppContext.Provider value={{ isLoggedIn: true, notifications: [] }}>
          <MemoryRouter initialEntries={['/accounts']}>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>,
      );
      fireEvent.click(screen.getByTitle('Accounts'));
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  describe('Settings', () => {
    it('go to the settings route', () => {
      render(
        <AppContext.Provider value={{ isLoggedIn: true, notifications: [] }}>
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
        <AppContext.Provider value={{ isLoggedIn: true, notifications: [] }}>
          <MemoryRouter initialEntries={['/settings']}>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>,
      );
      fireEvent.click(screen.getByTitle('Settings'));
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('opens github in the notifications page', () => {
    render(
      <AppContext.Provider
        value={{
          isLoggedIn: true,
          notifications: mockAccountNotifications,
        }}
      >
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>,
    );
    fireEvent.click(screen.getByLabelText('4 Unread Notifications'));
    expect(shell.openExternal).toHaveBeenCalledTimes(1);
    expect(shell.openExternal).toHaveBeenCalledWith(
      'https://github.com/notifications',
    );
  });

  it('should quit the app', () => {
    render(
      <AppContext.Provider value={{ isLoggedIn: false, notifications: [] }}>
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>,
    );
    fireEvent.click(screen.getByTitle('Quit Gitify'));
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('app-quit');
  });

  it('should open the gitify repository', () => {
    render(
      <AppContext.Provider value={{ isLoggedIn: false, notifications: [] }}>
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>,
    );
    fireEvent.click(screen.getByTestId('gitify-logo'));
    expect(shell.openExternal).toHaveBeenCalledTimes(1);
    expect(shell.openExternal).toHaveBeenCalledWith(
      'https://github.com/gitify-app/gitify',
    );
  });

  describe('should render the notifications icon', () => {
    it('when there are 0 notifications', () => {
      render(
        <AppContext.Provider value={{ isLoggedIn: true, notifications: [] }}>
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
          }}
        >
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      const notificationsIcon = screen.getByTitle('4 Unread Notifications');
      expect(notificationsIcon.className).toContain('text-green-500');
      expect(notificationsIcon.childNodes.length).toBe(2);
      expect(notificationsIcon.childNodes[0].nodeName).toBe('svg');
      expect(notificationsIcon.childNodes[1].nodeValue).toBe('4');
    });
  });
});
