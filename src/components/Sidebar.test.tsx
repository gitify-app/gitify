import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { renderWithAppContext } from '../__helpers__/test-utils';
import { mockAccountNotifications } from '../__mocks__/notifications-mocks';
import { mockSettings } from '../__mocks__/state-mocks';
import * as comms from '../utils/comms';
import { Sidebar } from './Sidebar';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => navigateMock,
}));

describe('renderer/components/Sidebar.tsx', () => {
  const fetchNotificationsMock = vi.fn();
  const openExternalLinkSpy = vi
    .spyOn(comms, 'openExternalLink')
    .mockImplementation(() => {});

  afterEach(() => {
    vi.clearAllMocks();
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

  it('should navigate home when clicking logo', async () => {
    renderWithAppContext(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByTestId('sidebar-home'));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
  });

  describe('notifications icon', () => {
    it('opens notifications home when clicked', async () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
      );

      await userEvent.click(screen.getByTestId('sidebar-notifications'));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith(
        'https://github.com/notifications',
      );
    });

    it('renders correct icon when there are no notifications', () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
        {
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
      );

      await userEvent.click(screen.getByTestId('sidebar-filter-notifications'));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/filters');
    });

    it('go to the home if filters path already shown', async () => {
      renderWithAppContext(
        <MemoryRouter initialEntries={['/filters']}>
          <Sidebar />
        </MemoryRouter>,
      );

      await userEvent.click(screen.getByTestId('sidebar-filter-notifications'));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
    });

    it('highlight filters sidebar if any are saved', () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
        {
          settings: {
            ...mockSettings,
            filterReasons: ['assign'],
          },
        },
      );

      expect(
        screen.getByTestId('sidebar-filter-notifications'),
      ).toMatchSnapshot();
    });
  });

  describe('quick links', () => {
    it('opens my github issues page', async () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
        {
          notifications: mockAccountNotifications,
        },
      );

      await userEvent.click(screen.getByTestId('sidebar-my-issues'));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith(
        'https://github.com/issues',
      );
    });

    it('opens my github pull requests page', async () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
        {
          notifications: mockAccountNotifications,
        },
      );

      await userEvent.click(screen.getByTestId('sidebar-my-pull-requests'));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith(
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
          fetchNotifications: fetchNotificationsMock,
          status: 'success',
        },
      );

      await userEvent.click(screen.getByTestId('sidebar-refresh'));

      expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);
    });

    it('should not refresh the notifications when status is loading', async () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
        {
          fetchNotifications: fetchNotificationsMock,
          status: 'loading',
        },
      );

      await userEvent.click(screen.getByTestId('sidebar-refresh'));

      expect(fetchNotificationsMock).not.toHaveBeenCalled();
    });
  });

  describe('Settings', () => {
    it('go to the settings route', async () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
      );

      await userEvent.click(screen.getByTestId('sidebar-settings'));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/settings');
    });

    it('go to the home if settings path already shown', async () => {
      renderWithAppContext(
        <MemoryRouter initialEntries={['/settings']}>
          <Sidebar />
        </MemoryRouter>,
        {
          fetchNotifications: fetchNotificationsMock,
        },
      );

      await userEvent.click(screen.getByTestId('sidebar-settings'));

      expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('should quit the app', async () => {
    const quitAppSpy = vi.spyOn(comms, 'quitApp').mockImplementation(() => {});

    renderWithAppContext(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
      {
        isLoggedIn: false,
      },
    );

    await userEvent.click(screen.getByTestId('sidebar-quit'));

    expect(quitAppSpy).toHaveBeenCalledTimes(1);
  });
});
