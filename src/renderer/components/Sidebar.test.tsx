import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../__helpers__/test-utils';
import { mockGitHubCloudAccount } from '../__mocks__/account-mocks';
import { mockSettings } from '../__mocks__/state-mocks';

import { useSettingsStore } from '../stores';

import * as comms from '../utils/system/comms';
import { Sidebar } from './Sidebar';

describe('renderer/components/Sidebar.tsx', () => {
  const fetchNotificationsMock = vi.fn();
  const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());

  let updateSettingSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    updateSettingSpy = vi.spyOn(useSettingsStore.getState(), 'updateSetting');
  });

  it('should render itself & its children (logged in)', () => {
    const tree = renderWithProviders(<Sidebar />, {
      initialEntries: ['/'],
      accounts: [mockGitHubCloudAccount],
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children (logged out)', () => {
    const tree = renderWithProviders(<Sidebar />, {
      initialEntries: ['/landing'],
      accounts: [],
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('should navigate home when clicking logo', async () => {
    renderWithProviders(<Sidebar />);

    await userEvent.click(screen.getByTestId('sidebar-home'));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
  });

  describe('notifications icon', () => {
    it('opens notifications home when clicked', async () => {
      renderWithProviders(<Sidebar />);

      await userEvent.click(screen.getByTestId('sidebar-notifications'));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith('https://github.com/notifications');
    });

    it('renders correct icon when there are no notifications', () => {
      renderWithProviders(<Sidebar />, {
        notifications: [],
      });

      expect(screen.getByTestId('sidebar-notifications')).toMatchSnapshot();
    });

    it('renders correct icon when there are notifications', () => {
      renderWithProviders(<Sidebar />, {
        notificationCount: 2,
        hasNotifications: true,
        hasUnreadNotifications: false,
      });

      expect(screen.getByTestId('sidebar-notifications')).toMatchSnapshot();
    });
  });

  describe('Focused mode toggle', () => {
    it('renders the focused mode is off', () => {
      renderWithProviders(<Sidebar />, {
        accounts: [mockGitHubCloudAccount],
        settings: { ...mockSettings, participating: false },
      });

      expect(screen.getByTestId('sidebar-focused-mode')).toBeInTheDocument();
    });

    it('renders the focused mode is on', () => {
      renderWithProviders(<Sidebar />, {
        accounts: [mockGitHubCloudAccount],
        settings: { ...mockSettings, participating: true },
      });

      expect(screen.getByTestId('sidebar-focused-mode')).toBeInTheDocument();
    });

    it('toggles participating when clicked', async () => {
      renderWithProviders(<Sidebar />, {
        accounts: [mockGitHubCloudAccount],
        settings: { ...mockSettings, participating: false },
        fetchNotifications: fetchNotificationsMock,
      });

      await userEvent.click(screen.getByTestId('sidebar-focused-mode'));

      expect(updateSettingSpy).toHaveBeenCalledTimes(1);
      expect(updateSettingSpy).toHaveBeenCalledWith('participating', true);
    });
  });

  describe('Filter notifications', () => {
    it('go to the filters route', async () => {
      renderWithProviders(<Sidebar />, {
        accounts: [mockGitHubCloudAccount],
      });

      await userEvent.click(screen.getByTestId('sidebar-filter-notifications'));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/filters');
    });

    it('go to the home if filters path already shown', async () => {
      renderWithProviders(<Sidebar />, {
        initialEntries: ['/filters'],
        accounts: [mockGitHubCloudAccount],
      });

      await userEvent.click(screen.getByTestId('sidebar-filter-notifications'));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
    });

    it('highlight filters sidebar if any are saved', () => {
      renderWithProviders(<Sidebar />, {
        accounts: [mockGitHubCloudAccount],
        settings: mockSettings,
        filters: { reasons: ['assign'] },
      });

      expect(screen.getByTestId('sidebar-filter-notifications')).toMatchSnapshot();
    });
  });

  describe('quick links', () => {
    it('opens my github issues page', async () => {
      renderWithProviders(<Sidebar />);

      await userEvent.click(screen.getByTestId('sidebar-my-issues'));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith('https://github.com/issues');
    });

    it('opens my github pull requests page', async () => {
      renderWithProviders(<Sidebar />);

      await userEvent.click(screen.getByTestId('sidebar-my-pull-requests'));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith('https://github.com/pulls');
    });
  });

  describe('Refresh Notifications', () => {
    it('should refresh the notifications when status is not loading', async () => {
      renderWithProviders(<Sidebar />, {
        accounts: [mockGitHubCloudAccount],
        fetchNotifications: fetchNotificationsMock,
        status: 'success',
      });

      await userEvent.click(screen.getByTestId('sidebar-refresh'));

      expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);
    });

    it('should not refresh the notifications when status is loading', async () => {
      renderWithProviders(<Sidebar />, {
        accounts: [mockGitHubCloudAccount],
        fetchNotifications: fetchNotificationsMock,
        status: 'loading',
      });

      await userEvent.click(screen.getByTestId('sidebar-refresh'));

      expect(fetchNotificationsMock).not.toHaveBeenCalled();
    });
  });

  describe('Settings', () => {
    it('go to the settings route', async () => {
      renderWithProviders(<Sidebar />, {
        accounts: [mockGitHubCloudAccount],
      });

      await userEvent.click(screen.getByTestId('sidebar-settings'));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/settings');
    });

    it('go to the home if settings path already shown', async () => {
      renderWithProviders(<Sidebar />, {
        initialEntries: ['/settings'],
        accounts: [mockGitHubCloudAccount],
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

    renderWithProviders(<Sidebar />, {
      accounts: [],
    });

    await userEvent.click(screen.getByTestId('sidebar-quit'));

    expect(quitAppSpy).toHaveBeenCalledTimes(1);
  });
  // Keyboard bindings moved to App.test.tsx
});
