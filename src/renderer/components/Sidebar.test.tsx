import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { renderWithAppContext } from '../__helpers__/test-utils';
import { mockAccountNotifications } from '../__mocks__/account-mocks';
import * as comms from '../utils/comms';
import { Sidebar } from './Sidebar';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('renderer/components/Sidebar.tsx', () => {
  const mockFetchNotifications = jest.fn();
  const mockOpenExternalLink = jest
    .spyOn(comms, 'openExternalLink')
    .mockImplementation();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render itself & its children (logged in)', () => {
    const tree = renderWithAppContext(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
      {
        isLoggedIn: true,
      },
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children (logged out)', () => {
    const tree = renderWithAppContext(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
      {
        isLoggedIn: false,
      },
    );

    expect(tree).toMatchSnapshot();
  });

  it('should navigate home when clicking the gitify logo', async () => {
    renderWithAppContext(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
      {
        isLoggedIn: false,
      },
    );

    await userEvent.click(screen.getByTestId('sidebar-home'));

    expect(mockNavigate).toHaveBeenNthCalledWith(1, '/', { replace: true });
  });

  describe('notifications icon', () => {
    it('opens notifications home when clicked', async () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
        {
          isLoggedIn: true,
        },
      );

      await userEvent.click(screen.getByTestId('sidebar-notifications'));

      expect(mockOpenExternalLink).toHaveBeenCalledTimes(1);
      expect(mockOpenExternalLink).toHaveBeenCalledWith(
        'https://github.com/notifications',
      );
    });

    it('renders correct icon when there are no notifications', () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
        {
          isLoggedIn: true,
          notifications: [],
        },
      );

      expect(screen.getByTestId('sidebar-notifications')).toMatchSnapshot();
    });

    it('renders correct icon when there are notifications', () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
        {
          isLoggedIn: true,
          notifications: mockAccountNotifications,
        },
      );

      expect(screen.getByTestId('sidebar-notifications')).toMatchSnapshot();
    });
  });

  describe('Filter notifications', () => {
    it('go to the filters route', async () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
        {
          isLoggedIn: true,
        },
      );

      await userEvent.click(screen.getByTestId('sidebar-filter-notifications'));

      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/filters');
    });

    it('go to the home if filters path already shown', async () => {
      renderWithAppContext(
        <MemoryRouter initialEntries={['/filters']}>
          <Sidebar />
        </MemoryRouter>,
        {
          isLoggedIn: true,
        },
      );

      await userEvent.click(screen.getByTestId('sidebar-filter-notifications'));

      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/', { replace: true });
    });
  });

  describe('quick links', () => {
    it('opens my github issues page', async () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
        {
          isLoggedIn: true,
          notifications: mockAccountNotifications,
        },
      );

      await userEvent.click(screen.getByTestId('sidebar-my-issues'));

      expect(mockOpenExternalLink).toHaveBeenCalledTimes(1);
      expect(mockOpenExternalLink).toHaveBeenCalledWith(
        'https://github.com/issues',
      );
    });

    it('opens my github pull requests page', async () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
        {
          isLoggedIn: true,
          notifications: mockAccountNotifications,
        },
      );

      await userEvent.click(screen.getByTestId('sidebar-my-pull-requests'));

      expect(mockOpenExternalLink).toHaveBeenCalledTimes(1);
      expect(mockOpenExternalLink).toHaveBeenCalledWith(
        'https://github.com/pulls',
      );
    });
  });

  describe('Refresh Notifications', () => {
    it('should refresh the notifications when status is not loading', async () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
        {
          isLoggedIn: true,
          notifications: [],
          fetchNotifications: mockFetchNotifications,
          status: 'success',
        },
      );

      await userEvent.click(screen.getByTestId('sidebar-refresh'));

      expect(mockFetchNotifications).toHaveBeenCalledTimes(1);
    });

    it('should not refresh the notifications when status is loading', async () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
        {
          isLoggedIn: true,
          notifications: [],
          fetchNotifications: mockFetchNotifications,
          status: 'loading',
        },
      );

      await userEvent.click(screen.getByTestId('sidebar-refresh'));

      expect(mockFetchNotifications).not.toHaveBeenCalled();
    });
  });

  describe('Settings', () => {
    it('go to the settings route', async () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
        {
          isLoggedIn: true,
        },
      );

      await userEvent.click(screen.getByTestId('sidebar-settings'));

      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/settings');
    });

    it('go to the home if settings path already shown', async () => {
      renderWithAppContext(
        <MemoryRouter initialEntries={['/settings']}>
          <Sidebar />
        </MemoryRouter>,
        {
          isLoggedIn: true,
          fetchNotifications: mockFetchNotifications,
        },
      );

      await userEvent.click(screen.getByTestId('sidebar-settings'));

      expect(mockFetchNotifications).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/', { replace: true });
    });
  });

  it('should quit the app', async () => {
    const mockQuitApp = jest.spyOn(comms, 'quitApp');

    renderWithAppContext(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
      {
        isLoggedIn: false,
      },
    );

    await userEvent.click(screen.getByTestId('sidebar-quit'));

    expect(mockQuitApp).toHaveBeenCalledTimes(1);
  });
});
