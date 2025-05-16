import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { mockAuth, mockSettings } from '../__mocks__/state-mocks';
import { AppContext } from '../context/App';
import { SettingsRoute } from './Settings';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('renderer/routes/Settings.tsx', () => {
  const fetchNotifications = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render itself & its children', async () => {
    await act(async () => {
      render(
        <AppContext.Provider value={{ auth: mockAuth, settings: mockSettings }}>
          <MemoryRouter>
            <SettingsRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    expect(screen.getByTestId('settings')).toMatchSnapshot();
  });

  it('should go back by pressing the icon', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            fetchNotifications,
          }}
        >
          <MemoryRouter>
            <SettingsRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    await userEvent.click(screen.getByTestId('header-nav-back'));

    expect(fetchNotifications).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
  });
});
