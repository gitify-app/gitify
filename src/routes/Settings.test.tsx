import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { mockAuth, mockSettings } from '../__mocks__/state-mocks';
import { AppContext } from '../context/App';
import { SettingsRoute } from './Settings';

global.ResizeObserver = require('resize-observer-polyfill');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('routes/Settings.tsx', () => {
  const fetchNotifications = jest.fn();
  const resetSettings = jest.fn();

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

    fireEvent.click(screen.getByLabelText('Go Back'));
    expect(fetchNotifications).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
  });

  it('should reset default settings when `OK`', async () => {
    window.confirm = jest.fn(() => true); // always click 'OK'

    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            resetSettings,
          }}
        >
          <MemoryRouter>
            <SettingsRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByText('Restore settings to their defaults'));
    expect(resetSettings).toHaveBeenCalled();
  });

  it('should skip reset default settings when `cancelled`', async () => {
    window.confirm = jest.fn(() => false); // always click 'cancel'

    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            resetSettings,
          }}
        >
          <MemoryRouter>
            <SettingsRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByText('Restore settings to their defaults'));
    expect(resetSettings).not.toHaveBeenCalled();
  });
});
