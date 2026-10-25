import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../__helpers__/test-utils';
import { mockGitHubCloudAccount } from '../__mocks__/account-mocks';

import { SettingsRoute } from './Settings';

describe('renderer/routes/Settings.tsx', () => {
  const fetchNotificationsMock = vi.fn();

  it('renders the settings outline and primary controls for every section', async () => {
    await act(async () => {
      renderWithProviders(<SettingsRoute />, {
        accounts: [mockGitHubCloudAccount],
        initialEntries: ['/settings'],
      });
    });

    expect(screen.getAllByRole('heading').map((heading) => heading.textContent)).toEqual([
      'Settings',
      'Appearance',
      'Inbox',
      'Fetch',
      'List',
      'GitHub',
      'Missing notification scopes',
      'Alerts',
      'Tray',
      'System',
    ]);

    const expectSetting = (label: string) => {
      expect(
        screen.getByText(label, { selector: 'button, span', ignore: '.sr-only' }),
      ).toBeInTheDocument();
    };

    // Appearance
    for (const label of ['Design', 'Theme', 'Increase contrast', 'Zoom']) {
      expectSetting(label);
    }

    // Inbox -> Fetch
    for (const label of [
      'Fetch interval',
      'Fetch all notifications',
      'Fetch read and done notifications',
    ]) {
      expectSetting(label);
    }

    // Inbox -> List
    for (const label of [
      'Group by',
      'Show account header',
      'Show full notification title',
      'Show reference',
      'Delay notification removal',
    ]) {
      expectSetting(label);
    }

    // Inbox -> GitHub
    for (const label of [
      'Fetch only participating',
      'Fetch detailed notifications',
      'Show notification metrics',
      'Mark as done on open',
      'Mark as done on unsubscribe',
    ]) {
      expectSetting(label);
    }

    // Alerts
    for (const label of [
      'Show desktop notifications',
      'Play notification sound',
      'Notification volume',
      'Show app update notifications',
    ]) {
      expectSetting(label);
    }

    // Tray
    for (const label of [
      'Show notification count',
      'Highlight unread notifications',
      'Idle icon',
    ]) {
      expectSetting(label);
    }

    // System
    for (const label of [
      'Link focus',
      'Enable global shortcut',
      'Global shortcut',
      'Keep window open when unfocused',
      'Launch at startup',
    ]) {
      expectSetting(label);
    }

    // Footer + reset
    expect(screen.getByRole('button', { name: 'Accounts' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset Settings' })).toBeInTheDocument();
  });

  it('should separate inbox behavior from alert delivery', async () => {
    await act(async () => {
      renderWithProviders(<SettingsRoute />, {
        accounts: [mockGitHubCloudAccount],
        initialEntries: ['/settings'],
      });
    });

    const section = (name: string) => {
      const fieldset = screen.getByRole('heading', { name }).closest('fieldset');

      if (!fieldset) {
        throw new Error(`Could not find the ${name} settings section`);
      }

      return fieldset;
    };

    const appearance = section('Appearance');
    const inbox = section('Inbox');
    const alerts = section('Alerts');
    const system = section('System');

    expect(within(inbox).getByTestId('switch-showPills')).toBeInTheDocument();
    expect(within(inbox).getByTestId('switch-wrapNotificationTitle')).toBeInTheDocument();
    expect(within(inbox).queryByTestId('switch-showNotifications')).not.toBeInTheDocument();
    expect(
      within(appearance).queryByTestId('switch-wrapNotificationTitle'),
    ).not.toBeInTheDocument();
    expect(within(alerts).getByTestId('switch-showNotifications')).toBeInTheDocument();
    expect(within(alerts).getByTestId('switch-showUpdateNotifications')).toBeInTheDocument();
    expect(within(alerts).queryByTestId('switch-showPills')).not.toBeInTheDocument();
    expect(within(system).queryByTestId('switch-showNotifications')).not.toBeInTheDocument();
    expect(within(system).queryByTestId('switch-showUpdateNotifications')).not.toBeInTheDocument();
  });

  it('should go back by pressing the icon', async () => {
    await act(async () => {
      renderWithProviders(<SettingsRoute />, {
        initialEntries: ['/settings'],
        fetchNotifications: fetchNotificationsMock,
      });
    });

    await userEvent.click(screen.getByTestId('header-nav-back'));

    expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });
});
