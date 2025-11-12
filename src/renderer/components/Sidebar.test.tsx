import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { mockAccountNotifications } from '../__mocks__/notifications-mocks';
import { mockAuth, mockSettings } from '../__mocks__/state-mocks';
import { AppContext } from '../context/App';
import * as comms from '../utils/comms';
import { Sidebar } from './Sidebar';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

describe('renderer/components/Sidebar.tsx', () => {
  const fetchNotifications = vi.fn();
  const openExternalLinkMock = vi
    .spyOn(comms, 'openExternalLink')
    .mockImplementation();

  afterEach(() => {
    vi.clearAllMocks();
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

  it('should navigate home when clicking the gitify logo', async () => {
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

    await userEvent.click(screen.getByTestId('sidebar-home'));

    expect(mockNavigate).toHaveBeenNthCalledWith(1, '/', { replace: true });
  });

  describe('notifications icon', () => {
    it('opens notifications home when clicked', async () => {
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

      await userEvent.click(screen.getByTestId('sidebar-notifications'));

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
    it('go to the filters route', async () => {
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

      await userEvent.click(screen.getByTestId('sidebar-filter-notifications'));

      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/filters');
    });

    it('go to the home if filters path already shown', async () => {
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

      await userEvent.click(screen.getByTestId('sidebar-filter-notifications'));

      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/', { replace: true });
    });
  });

  describe('quick links', () => {
    it('opens my github issues page', async () => {
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

      await userEvent.click(screen.getByTestId('sidebar-my-issues'));

      expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
      expect(openExternalLinkMock).toHaveBeenCalledWith(
        'https://github.com/issues',
      );
    });

    it('opens my github pull requests page', async () => {
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

      await userEvent.click(screen.getByTestId('sidebar-my-pull-requests'));

      expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
      expect(openExternalLinkMock).toHaveBeenCalledWith(
        'https://github.com/pulls',
      );
    });
  });

  describe('Refresh Notifications', () => {
    it('should refresh the notifications when status is not loading', async () => {
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

      await userEvent.click(screen.getByTestId('sidebar-refresh'));

      expect(fetchNotifications).toHaveBeenCalledTimes(1);
    });

    it('should not refresh the notifications when status is loading', async () => {
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

      await userEvent.click(screen.getByTestId('sidebar-refresh'));

      expect(fetchNotifications).not.toHaveBeenCalled();
    });
  });

  describe('Settings', () => {
    it('go to the settings route', async () => {
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

      await userEvent.click(screen.getByTestId('sidebar-settings'));

      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/settings');
    });

    it('go to the home if settings path already shown', async () => {
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

      await userEvent.click(screen.getByTestId('sidebar-settings'));

      expect(fetchNotifications).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/', { replace: true });
    });
  });

  it('should quit the app', async () => {
    const quitAppMock = vi.spyOn(comms, 'quitApp');

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

    await userEvent.click(screen.getByTestId('sidebar-quit'));

    expect(quitAppMock).toHaveBeenCalledTimes(1);
  });
});
