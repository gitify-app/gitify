import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../__helpers__/test-utils';
import { mockGitHubCloudAccount } from '../__mocks__/account-mocks';

import { SettingsRoute } from './Settings';

describe('renderer/routes/Settings.tsx', () => {
  const fetchNotificationsMock = vi.fn();

  it('should render itself & its children', async () => {
    await act(async () => {
      renderWithProviders(<SettingsRoute />, {
        accounts: [mockGitHubCloudAccount],
        initialEntries: ['/settings'],
      });
    });

    expect(screen.getByTestId('settings')).toMatchSnapshot();
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
