import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../__helpers__/test-utils';

import { SettingsRoute } from './Settings';

describe('renderer/routes/Settings.tsx', () => {
  const fetchNotificationsMock = vi.fn();

  it('should render itself & its children', async () => {
    await act(async () => {
      renderWithProviders(<SettingsRoute />, {
        initialEntries: ['/settings'],
      });
    });

    expect(screen.getByTestId('settings')).toMatchSnapshot();
  });

  it('should separate inbox behavior from alert delivery', async () => {
    await act(async () => {
      renderWithProviders(<SettingsRoute />, {
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

    const inbox = section('Inbox');
    const alerts = section('Alerts');
    const system = section('System');

    expect(within(inbox).getByTestId('checkbox-showPills')).toBeInTheDocument();
    expect(within(inbox).queryByTestId('checkbox-showNotifications')).not.toBeInTheDocument();
    expect(within(alerts).getByTestId('checkbox-showNotifications')).toBeInTheDocument();
    expect(within(alerts).queryByTestId('checkbox-showPills')).not.toBeInTheDocument();
    expect(within(system).queryByTestId('checkbox-showNotifications')).not.toBeInTheDocument();
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
