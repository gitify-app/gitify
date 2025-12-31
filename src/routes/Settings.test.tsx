import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../__helpers__/test-utils';
import { SettingsRoute } from './Settings';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => navigateMock,
}));

describe('renderer/routes/Settings.tsx', () => {
  const fetchNotificationsMock = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render itself & its children', async () => {
    await act(async () => {
      renderWithAppContext(<SettingsRoute />);
    });

    expect(screen.getByTestId('settings')).toMatchSnapshot();
  });

  it('should go back by pressing the icon', async () => {
    await act(async () => {
      renderWithAppContext(<SettingsRoute />, {
        fetchNotifications: fetchNotificationsMock,
      });
    });

    await userEvent.click(screen.getByTestId('header-nav-back'));

    expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });
});
