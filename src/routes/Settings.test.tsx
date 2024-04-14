import { act, fireEvent, render, screen } from '@testing-library/react';

import { MemoryRouter } from 'react-router-dom';

const { ipcRenderer } = require('electron');

import type { AxiosResponse } from 'axios';
import { shell } from 'electron';
import { mockAccounts, mockSettings } from '../__mocks__/mock-state';
import { AppContext } from '../context/App';
import * as apiRequests from '../utils/api-requests';
import Constants from '../utils/constants';
import { SettingsRoute } from './Settings';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
jest.spyOn(apiRequests, 'apiRequestAuth').mockResolvedValue({
  headers: {
    'x-oauth-scopes': Constants.AUTH_SCOPE.join(', '),
  },
} as unknown as AxiosResponse);

describe('routes/Settings.tsx', () => {
  const updateSetting = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render itself & its children', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{ settings: mockSettings, accounts: mockAccounts }}
        >
          <MemoryRouter>
            <SettingsRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    expect(screen.getByTestId('settings')).toMatchSnapshot();
  });

  it('should press the logout', async () => {
    const logoutMock = jest.fn();
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            settings: mockSettings,
            accounts: mockAccounts,
            logout: logoutMock,
          }}
        >
          <MemoryRouter>
            <SettingsRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByTitle('Logout from octocat'));

    expect(logoutMock).toHaveBeenCalledTimes(1);

    expect(ipcRenderer.send).toHaveBeenCalledTimes(2);
    expect(ipcRenderer.send).toHaveBeenCalledWith('update-icon');
    expect(ipcRenderer.send).toHaveBeenCalledWith('update-title', '');
    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
  });

  it('should go back by pressing the icon', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            settings: mockSettings,
            accounts: mockAccounts,
          }}
        >
          <MemoryRouter>
            <SettingsRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByLabelText('Go Back'));
    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
  });

  it('should toggle the showOnlyParticipating checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            settings: mockSettings,
            accounts: mockAccounts,
            updateSetting,
          }}
        >
          <MemoryRouter>
            <SettingsRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByLabelText('Show only participating'), {
      target: { checked: true },
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('participating', false);
  });

  it('should toggle the showBots checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            settings: mockSettings,
            accounts: mockAccounts,
            updateSetting,
          }}
        >
          <MemoryRouter>
            <SettingsRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(
      screen.getByLabelText('Show notifications from Bot accounts'),
      {
        target: { checked: true },
      },
    );

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('showBots', false);
  });

  it('should toggle the showNotificationsCountInTray checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            settings: mockSettings,
            accounts: mockAccounts,
            updateSetting,
          }}
        >
          <MemoryRouter>
            <SettingsRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByLabelText('Show notifications count in tray'), {
      target: { checked: true },
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith(
      'showNotificationsCountInTray',
      false,
    );
  });

  it('should toggle the playSound checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            settings: mockSettings,
            accounts: mockAccounts,
            updateSetting,
          }}
        >
          <MemoryRouter>
            <SettingsRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByLabelText('Play sound'), {
      target: { checked: true },
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('playSound', false);
  });

  it('should toggle the showNotifications checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            settings: mockSettings,
            accounts: mockAccounts,
            updateSetting,
          }}
        >
          <MemoryRouter>
            <SettingsRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByLabelText('Show system notifications'), {
      target: { checked: true },
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('showNotifications', false);
  });

  it('should toggle the markAsDoneOnOpen checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            settings: mockSettings,
            accounts: mockAccounts,
            updateSetting,
          }}
        >
          <MemoryRouter>
            <SettingsRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByLabelText('Mark as done on open'), {
      target: { checked: true },
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('markAsDoneOnOpen', false);
  });

  it('should toggle the openAtStartup checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            settings: mockSettings,
            accounts: mockAccounts,
            updateSetting,
          }}
        >
          <MemoryRouter>
            <SettingsRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByLabelText('Open at startup'), {
      target: { checked: true },
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('openAtStartup', false);
  });

  it('should change the theme radio group', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            settings: mockSettings,
            accounts: mockAccounts,
            updateSetting,
          }}
        >
          <MemoryRouter>
            <SettingsRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByLabelText('Light'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('theme', 'LIGHT');
  });

  it('should go to the enterprise login route', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            settings: mockSettings,
            accounts: mockAccounts,
          }}
        >
          <MemoryRouter>
            <SettingsRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByTitle('Login with GitHub Enterprise'));
    expect(mockNavigate).toHaveBeenNthCalledWith(1, '/login-enterprise', {
      replace: true,
    });
  });

  it('should quit the app', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{ settings: mockSettings, accounts: mockAccounts }}
        >
          <MemoryRouter>
            <SettingsRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByTitle('Quit Gitify'));
    expect(ipcRenderer.send).toHaveBeenCalledWith('app-quit');
  });

  it('should be able to enable detailed notifications', async () => {
    jest.spyOn(apiRequests, 'apiRequestAuth').mockResolvedValue({
      headers: {
        'x-oauth-scopes': Constants.AUTH_SCOPE.join(', '),
      },
    } as unknown as AxiosResponse);

    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            settings: mockSettings,
            accounts: mockAccounts,
            updateSetting,
          }}
        >
          <MemoryRouter>
            <SettingsRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    await screen.findByLabelText('Detailed notifications');

    fireEvent.click(screen.getByLabelText('Detailed notifications'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('detailedNotifications', true);
  });

  it('should not be able to enable detailed notifications due to missing scope', async () => {
    jest.spyOn(apiRequests, 'apiRequestAuth').mockResolvedValue({
      headers: {
        'x-oauth-scopes': 'read:user, notifications',
      },
    } as unknown as AxiosResponse);

    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            settings: mockSettings,
            accounts: mockAccounts,
            updateSetting,
          }}
        >
          <MemoryRouter>
            <SettingsRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    expect(
      screen
        .getByLabelText('Detailed notifications (requires repo scope)')
        .closest('input'),
    ).toHaveProperty('disabled', true);

    // click the checkbox
    fireEvent.click(
      screen.getByLabelText('Detailed notifications (requires repo scope)'),
    );

    // check if the checkbox is still unchecked
    expect(updateSetting).not.toHaveBeenCalled();
    expect(
      screen.getByLabelText('Detailed notifications (requires repo scope)'),
    ).not.toBe('checked');

    expect(
      screen.getByLabelText('Detailed notifications (requires repo scope)')
        .parentNode.parentNode,
    ).toMatchSnapshot();
  });

  it('should open release notes', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            settings: mockSettings,
            accounts: mockAccounts,
          }}
        >
          <MemoryRouter>
            <SettingsRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByTitle('View release notes'));

    expect(shell.openExternal).toHaveBeenCalledTimes(1);
    expect(shell.openExternal).toHaveBeenCalledWith(
      'https://github.com/gitify-app/gitify/releases/tag/v0.0.1',
    );
  });
});
