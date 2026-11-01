import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../__helpers__/test-utils';
import { mockGitHubCloudAccount } from '../__mocks__/account-mocks';
import { mockSettings } from '../__mocks__/state-mocks';

import { APPLICATION } from '../../shared/constants';

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

  it('renders the logged-in controls', () => {
    renderWithProviders(<Sidebar />, {
      initialEntries: ['/'],
      accounts: [mockGitHubCloudAccount],
    });

    for (const name of [
      /^Notifications/,
      /^Toggle focused mode/,
      /^My issues/,
      /^My pull requests/,
      /^Refresh/,
    ]) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }

    for (const name of [new RegExp(`^${APPLICATION.NAME}`), /^Filters/, /^Settings/]) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument();
    }

    expect(
      screen.queryByRole('button', { name: new RegExp(`^Quit ${APPLICATION.NAME}`) }),
    ).not.toBeInTheDocument();
  });

  it('renders the logged-out controls', () => {
    renderWithProviders(<Sidebar />, {
      initialEntries: ['/landing'],
      accounts: [],
    });

    expect(
      screen.getByRole('link', { name: new RegExp(`^${APPLICATION.NAME}`) }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: new RegExp(`^Quit ${APPLICATION.NAME}`) }),
    ).toBeInTheDocument();

    for (const name of [
      /^Notifications/,
      /^Toggle focused mode/,
      /^Filters/,
      /^Refresh/,
      /^Settings/,
    ]) {
      expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
    }
  });

  it('hides host shortcuts when logged out', () => {
    renderWithProviders(<Sidebar />, {
      initialEntries: ['/landing'],
      accounts: [],
    });

    expect(screen.queryByRole('button', { name: /^Notifications/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^My issues/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^My pull requests/ })).not.toBeInTheDocument();
  });

  it('navigates home when clicking logo', async () => {
    renderWithProviders(<Sidebar />);

    await userEvent.click(screen.getByRole('link', { name: new RegExp(`^${APPLICATION.NAME}`) }));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
  });

  describe('notifications icon', () => {
    it('opens notifications home when clicked', async () => {
      renderWithProviders(<Sidebar />, {
        accounts: [mockGitHubCloudAccount],
      });

      await userEvent.click(screen.getByRole('button', { name: /^Notifications/ }));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith('https://github.com/notifications');
    });

    it('highlights the notifications button when there are unread notifications', () => {
      renderWithProviders(<Sidebar />, {
        accounts: [mockGitHubCloudAccount],
        hasUnreadNotifications: true,
      });

      expect(screen.getByRole('button', { name: /^Notifications/ })).toHaveAttribute(
        'data-variant',
        'primary',
      );
    });

    it('does not highlight the notifications button when all notifications are read', () => {
      renderWithProviders(<Sidebar />, {
        accounts: [mockGitHubCloudAccount],
        hasUnreadNotifications: false,
      });

      expect(screen.getByRole('button', { name: /^Notifications/ })).toHaveAttribute(
        'data-variant',
        'invisible',
      );
    });
  });

  describe('Focused mode toggle', () => {
    it('renders the focused mode is off', () => {
      renderWithProviders(<Sidebar />, {
        accounts: [mockGitHubCloudAccount],
        settings: { ...mockSettings, participating: false },
      });

      expect(screen.getByRole('button', { name: /^Toggle focused mode/ })).toHaveAttribute(
        'data-variant',
        'invisible',
      );
    });

    it('renders the focused mode is on', () => {
      renderWithProviders(<Sidebar />, {
        accounts: [mockGitHubCloudAccount],
        settings: { ...mockSettings, participating: true },
      });

      expect(screen.getByRole('button', { name: /^Toggle focused mode/ })).toHaveAttribute(
        'data-variant',
        'primary',
      );
    });

    it('toggles participating when clicked', async () => {
      renderWithProviders(<Sidebar />, {
        accounts: [mockGitHubCloudAccount],
        settings: { ...mockSettings, participating: false },
        fetchNotifications: fetchNotificationsMock,
      });

      await userEvent.click(screen.getByRole('button', { name: /^Toggle focused mode/ }));

      expect(updateSettingSpy).toHaveBeenCalledTimes(1);
      expect(updateSettingSpy).toHaveBeenCalledWith('participating', true);
    });
  });

  describe('Filter notifications', () => {
    it('go to the filters route', async () => {
      renderWithProviders(<Sidebar />, {
        accounts: [mockGitHubCloudAccount],
      });

      await userEvent.click(screen.getByRole('link', { name: /^Filters/ }));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/filters');
    });

    it('go to the home if filters path already shown', async () => {
      renderWithProviders(<Sidebar />, {
        initialEntries: ['/filters'],
        accounts: [mockGitHubCloudAccount],
      });

      await userEvent.click(screen.getByRole('link', { name: /^Filters/ }));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
    });

    it('highlight filters sidebar if any are saved', () => {
      renderWithProviders(<Sidebar />, {
        accounts: [mockGitHubCloudAccount],
        settings: mockSettings,
        filters: { reasons: ['assign'] },
      });

      expect(screen.getByRole('link', { name: /^Filters/ })).toHaveAttribute(
        'data-variant',
        'primary',
      );
    });
  });

  describe('quick links', () => {
    it('opens my github issues page', async () => {
      renderWithProviders(<Sidebar />, {
        accounts: [mockGitHubCloudAccount],
      });

      await userEvent.click(screen.getByRole('button', { name: /^My issues/ }));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith('https://github.com/issues');
    });

    it('opens my github pull requests page', async () => {
      renderWithProviders(<Sidebar />, {
        accounts: [mockGitHubCloudAccount],
      });

      await userEvent.click(screen.getByRole('button', { name: /^My pull requests/ }));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith('https://github.com/pulls');
    });
  });

  describe('Refresh Notifications', () => {
    it('refreshes the notifications when status is not loading', async () => {
      renderWithProviders(<Sidebar />, {
        accounts: [mockGitHubCloudAccount],
        fetchNotifications: fetchNotificationsMock,
        status: 'success',
      });

      await userEvent.click(screen.getByRole('button', { name: /^Refresh/ }));

      expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);
    });

    it('does not refresh the notifications when status is loading', async () => {
      renderWithProviders(<Sidebar />, {
        accounts: [mockGitHubCloudAccount],
        fetchNotifications: fetchNotificationsMock,
        status: 'loading',
      });

      await userEvent.click(screen.getByRole('button', { name: /^Refresh/ }));

      expect(fetchNotificationsMock).not.toHaveBeenCalled();
    });

    it('shows a loading spinner on the refresh icon while the initial fetch is loading', () => {
      renderWithProviders(<Sidebar />, {
        accounts: [mockGitHubCloudAccount],
        status: 'loading',
      });

      expect(screen.getByRole('button', { name: /^Refresh/ })).toHaveAttribute(
        'data-loading',
        'true',
      );
      expect(screen.getByRole('button', { name: /^Refresh/ })).toBeDisabled();
    });

    it('shows a loading spinner on the refresh icon while a background fetch is in flight, regardless of settled status', () => {
      const tree = renderWithProviders(<Sidebar />, {
        accounts: [mockGitHubCloudAccount],
        status: 'error',
        isFetching: true,
      });

      expect(screen.getByRole('button', { name: /^Refresh/ })).toHaveAttribute(
        'data-loading',
        'true',
      );
      expect(tree.container.querySelector('[data-component="Spinner"]')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Refresh/ })).toBeDisabled();
    });

    it('does not show a loading spinner on the refresh icon when settled and no fetch is in flight', () => {
      renderWithProviders(<Sidebar />, {
        accounts: [mockGitHubCloudAccount],
        status: 'error',
        isFetching: false,
      });

      expect(screen.getByRole('button', { name: /^Refresh/ })).toHaveAttribute(
        'data-loading',
        'false',
      );
      expect(screen.getByRole('button', { name: /^Refresh/ })).toBeEnabled();
    });
  });

  describe('Settings', () => {
    it('go to the settings route', async () => {
      renderWithProviders(<Sidebar />, {
        accounts: [mockGitHubCloudAccount],
      });

      await userEvent.click(screen.getByRole('link', { name: /^Settings/ }));

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/settings');
    });

    it('go to the home if settings path already shown', async () => {
      renderWithProviders(<Sidebar />, {
        initialEntries: ['/settings'],
        accounts: [mockGitHubCloudAccount],
        fetchNotifications: fetchNotificationsMock,
      });

      await userEvent.click(screen.getByRole('link', { name: /^Settings/ }));

      expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('quits the app', async () => {
    const quitAppSpy = vi.spyOn(comms, 'quitApp').mockImplementation(vi.fn());

    renderWithProviders(<Sidebar />, {
      accounts: [],
    });

    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(`^Quit ${APPLICATION.NAME}`) }),
    );

    expect(quitAppSpy).toHaveBeenCalledTimes(1);
  });
  // Keyboard bindings moved to App.test.tsx
});
