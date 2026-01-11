import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { renderWithAppContext } from '../__helpers__/test-utils';
import { mockMultipleAccountNotifications } from '../__mocks__/notifications-mocks';
import { mockSettings } from '../__mocks__/state-mocks';
import * as comms from '../utils/comms';
import { Sidebar } from './Sidebar';

const navigateMock = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => navigateMock,
}));

describe('renderer/components/Sidebar.tsx', () => {
  const fetchNotificationsMock = jest.fn();
  const updateSettingMock = jest.fn();
  const openExternalLinkSpy = jest
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
          notifications: mockMultipleAccountNotifications,
        },
      );

      expect(screen.getByTestId('sidebar-notifications')).toMatchSnapshot();
    });
  });

  describe('Focused mode toggle', () => {
    it('renders the focused mode is off', () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
        {
          isLoggedIn: true,
          settings: { ...mockSettings, participating: false },
        },
      );

      expect(screen.getByTestId('sidebar-focused-mode')).toBeInTheDocument();
    });

    it('renders the focused mode is on', () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
        {
          isLoggedIn: true,
          settings: { ...mockSettings, participating: true },
        },
      );

      expect(screen.getByTestId('sidebar-focused-mode')).toBeInTheDocument();
    });

    it('toggles participating when clicked', async () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
        {
          isLoggedIn: true,
          settings: { ...mockSettings, participating: false },
          updateSetting: updateSettingMock,
          fetchNotifications: fetchNotificationsMock,
        },
      );

      await userEvent.click(screen.getByTestId('sidebar-focused-mode'));

      expect(updateSettingMock).toHaveBeenCalledTimes(1);
      expect(updateSettingMock).toHaveBeenCalledWith('participating', true);
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
          notifications: mockMultipleAccountNotifications,
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
          notifications: mockMultipleAccountNotifications,
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
    const quitAppSpy = jest.spyOn(comms, 'quitApp').mockImplementation();

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

  describe('keyboard bindings', () => {
    it('should navigate home when pressing H key', async () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
      );

      await userEvent.keyboard('h');

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
    });

    it('should refresh notifications when pressing R key', async () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
        {
          fetchNotifications: fetchNotificationsMock,
          status: 'success',
        },
      );

      await userEvent.keyboard('r');

      expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
      expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);
    });

    it('should not refresh notifications when pressing R key if status is loading', async () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
        {
          fetchNotifications: fetchNotificationsMock,
          status: 'loading',
        },
      );

      await userEvent.keyboard('r');

      expect(fetchNotificationsMock).not.toHaveBeenCalled();
    });

    it('should toggle settings when pressing S key while logged in', async () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
        {
          isLoggedIn: true,
        },
      );

      await userEvent.keyboard('s');

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/settings');
    });

    it('should not toggle settings when pressing S key while logged out', async () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
        {
          isLoggedIn: false,
        },
      );

      await userEvent.keyboard('s');

      expect(navigateMock).not.toHaveBeenCalled();
    });

    it('should toggle filters when pressing F key while logged in', async () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
        {
          isLoggedIn: true,
        },
      );

      await userEvent.keyboard('f');

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/filters');
    });

    it('should not toggle filters when pressing F key while logged out', async () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
        {
          isLoggedIn: false,
        },
      );

      await userEvent.keyboard('f');

      expect(navigateMock).not.toHaveBeenCalled();
    });

    it('should ignore keyboard shortcuts when typing in an input', async () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
      );

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      await userEvent.keyboard('h');

      expect(navigateMock).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });

    it('should ignore keyboard shortcuts when typing in a textarea', async () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
      );

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      textarea.focus();

      await userEvent.keyboard('r');

      expect(navigateMock).not.toHaveBeenCalled();
      expect(fetchNotificationsMock).not.toHaveBeenCalled();

      document.body.removeChild(textarea);
    });

    it('should ignore keyboard shortcuts when modifier keys are pressed', async () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
        {
          fetchNotifications: fetchNotificationsMock,
          status: 'success',
        },
      );

      // Note: userEvent.keyboard with modifier syntax like {Shift>h</Shift>}
      // would require holding shift, but we test that metaKey/ctrlKey/altKey
      // prevent action through manual event dispatch
      const event = new KeyboardEvent('keydown', {
        key: 'h',
        metaKey: true,
      });
      document.dispatchEvent(event);

      expect(navigateMock).not.toHaveBeenCalled();
    });

    it('should work with uppercase key press', async () => {
      renderWithAppContext(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>,
      );

      // userEvent.keyboard converts to lowercase automatically
      await userEvent.keyboard('H');

      expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
    });
  });
});
