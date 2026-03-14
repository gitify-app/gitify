import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithAppContext } from '../__helpers__/test-utils';
import { mockMultipleAccountNotifications } from '../__mocks__/notifications-mocks';

import { useAccountsStore, useFiltersStore, useSettingsStore } from '../stores';
import * as comms from '../utils/system/comms';
import { Sidebar } from './Sidebar';

describe('renderer/components/Sidebar.tsx', () => {
  const fetchNotificationsMock = vi.fn();
  const updateSettingMock = vi.fn();
  const openExternalLinkSpy = vi
    .spyOn(comms, 'openExternalLink')
    .mockImplementation(vi.fn());

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render itself & its children (logged in)', () => {
    const tree = renderWithAppContext(<Sidebar />, {
      initialEntries: ['/'],
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children (logged out)', () => {
    useAccountsStore.setState({ accounts: [] });
    const tree = renderWithAppContext(<Sidebar />, {
      initialEntries: ['/landing'],
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('should navigate home when clicking logo', async () => {
    renderWithAppContext(<Sidebar />);

    await userEvent.click(screen.getByTestId('sidebar-home'));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
  });

  describe('notifications icon', () => {
    it('opens notifications home when clicked', async () => {
      renderWithAppContext(<Sidebar />);

      await userEvent.click(screen.getByTestId('sidebar-notifications'));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith(
        'https://github.com/notifications',
      );
    });

    it('renders correct icon when there are no notifications', () => {
      renderWithAppContext(<Sidebar />, {
        notifications: [],
      });

      expect(screen.getByTestId('sidebar-notifications')).toMatchSnapshot();
    });

    it('renders correct icon when there are notifications', () => {
      renderWithAppContext(<Sidebar />, {
        notifications: mockMultipleAccountNotifications,
      });

      expect(screen.getByTestId('sidebar-notifications')).toMatchSnapshot();
    });
  });

  describe('Focused mode toggle', () => {
    it('renders the focused mode is off', () => {
      useSettingsStore.setState({ participating: false });
      renderWithAppContext(<Sidebar />);

      expect(screen.getByTestId('sidebar-focused-mode')).toBeInTheDocument();
    });

    it('renders the focused mode is on', () => {
      useSettingsStore.setState({ participating: true });
      renderWithAppContext(<Sidebar />);

      expect(screen.getByTestId('sidebar-focused-mode')).toBeInTheDocument();
    });

    it('toggles participating when clicked', async () => {
      useSettingsStore.setState({ participating: false, updateSetting: updateSettingMock as any });
      renderWithAppContext(<Sidebar />, {
        fetchNotifications: fetchNotificationsMock,
      });

      await userEvent.click(screen.getByTestId('sidebar-focused-mode'));

      expect(updateSettingMock).toHaveBeenCalledTimes(1);
      expect(updateSettingMock).toHaveBeenCalledWith('participating', true);
    });
  });

  describe('Filter notifications', () => {
    it('go to the filters route', async () => {
      renderWithAppContext(<Sidebar />);

      await userEvent.click(screen.getByTestId('sidebar-filter-notifications'));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/filters');
    });

    it('go to the home if filters path already shown', async () => {
      renderWithAppContext(<Sidebar />, { initialEntries: ['/filters'] });

      await userEvent.click(screen.getByTestId('sidebar-filter-notifications'));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
    });

    it('highlight filters sidebar if any are saved', () => {
      useFiltersStore.setState({ reasons: ['assign'] });

      renderWithAppContext(<Sidebar />);

      expect(
        screen.getByTestId('sidebar-filter-notifications'),
      ).toMatchSnapshot();
    });
  });

  describe('quick links', () => {
    it('opens my github issues page', async () => {
      renderWithAppContext(<Sidebar />, {
        notifications: mockMultipleAccountNotifications,
      });

      await userEvent.click(screen.getByTestId('sidebar-my-issues'));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith(
        'https://github.com/issues',
      );
    });

    it('opens my github pull requests page', async () => {
      renderWithAppContext(<Sidebar />, {
        notifications: mockMultipleAccountNotifications,
      });

      await userEvent.click(screen.getByTestId('sidebar-my-pull-requests'));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith(
        'https://github.com/pulls',
      );
    });
  });

  describe('Refresh Notifications', () => {
    it('should refresh the notifications when status is not loading', async () => {
      renderWithAppContext(<Sidebar />, {
        fetchNotifications: fetchNotificationsMock,
        status: 'success',
      });

      await userEvent.click(screen.getByTestId('sidebar-refresh'));

      expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);
    });

    it('should not refresh the notifications when status is loading', async () => {
      renderWithAppContext(<Sidebar />, {
        fetchNotifications: fetchNotificationsMock,
        status: 'loading',
      });

      await userEvent.click(screen.getByTestId('sidebar-refresh'));

      expect(fetchNotificationsMock).not.toHaveBeenCalled();
    });
  });

  describe('Settings', () => {
    it('go to the settings route', async () => {
      renderWithAppContext(<Sidebar />);

      await userEvent.click(screen.getByTestId('sidebar-settings'));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/settings');
    });

    it('go to the home if settings path already shown', async () => {
      renderWithAppContext(<Sidebar />, {
        initialEntries: ['/settings'],
        fetchNotifications: fetchNotificationsMock,
      });

      await userEvent.click(screen.getByTestId('sidebar-settings'));

      expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('should quit the app', async () => {
    const quitAppSpy = vi.spyOn(comms, 'quitApp').mockImplementation(vi.fn());

    useAccountsStore.setState({ accounts: [] });
    renderWithAppContext(<Sidebar />);

    await userEvent.click(screen.getByTestId('sidebar-quit'));

    expect(quitAppSpy).toHaveBeenCalledTimes(1);
  });
  // Keyboard bindings moved to App.test.tsx
});
