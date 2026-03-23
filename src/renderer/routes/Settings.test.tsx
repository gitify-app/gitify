import { act, screen } from '@testing-library/react';
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
