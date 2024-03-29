import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

const { ipcRenderer } = require('electron');

import { AxiosResponse } from 'axios';
import { mockAccounts, mockSettings } from '../__mocks__/mock-state';
import { AppContext } from '../context/App';
import * as apiRequests from '../utils/api-requests';
import Constants from '../utils/constants';
import { SettingsRoute } from './Settings';
import { shell } from 'electron';

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
    let getByTitle;

    await act(async () => {
      const { getByTitle: getByLabelTextLocal } = render(
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

      getByTitle = getByLabelTextLocal;
    });

    fireEvent.click(getByTitle('Logout'));

    expect(logoutMock).toHaveBeenCalledTimes(1);

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('update-icon', {
      notificationsCount: undefined,
      showNotificationsCountInTray: undefined,
    });
    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
  });

  it('should go back by pressing the icon', async () => {
    let getByLabelText;

    await act(async () => {
      const { getByLabelText: getByLabelTextLocal } = render(
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

      getByLabelText = getByLabelTextLocal;
    });
    fireEvent.click(getByLabelText('Go Back'));
    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
  });

  it('should toggle the showOnlyParticipating checkbox', async () => {
    let getByLabelText;

    await act(async () => {
      const { getByLabelText: getByLabelTextLocal } = render(
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
      getByLabelText = getByLabelTextLocal;
    });

    fireEvent.click(getByLabelText('Show only participating'), {
      target: { checked: true },
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('participating', false);
  });

  it('should toggle the showBots checkbox', async () => {
    let getByLabelText;

    await act(async () => {
      const { getByLabelText: getByLabelTextLocal } = render(
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
      getByLabelText = getByLabelTextLocal;
    });

    fireEvent.click(getByLabelText('Show notifications from Bot accounts'), {
      target: { checked: true },
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('showBots', false);
  });

  it('should toggle the playSound checkbox', async () => {
    let getByLabelText;

    await act(async () => {
      const { getByLabelText: getByLabelTextLocal } = render(
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
      getByLabelText = getByLabelTextLocal;
    });

    fireEvent.click(getByLabelText('Play sound'), {
      target: { checked: true },
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('playSound', false);
  });

  it('should toggle the showNotifications checkbox', async () => {
    let getByLabelText;

    await act(async () => {
      const { getByLabelText: getByLabelTextLocal } = render(
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
      getByLabelText = getByLabelTextLocal;
    });

    fireEvent.click(getByLabelText('Show notifications'), {
      target: { checked: true },
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('showNotifications', false);
  });

  it('should toggle the showNotificationsCountInTray checkbox', async () => {
    let getByLabelText;

    await act(async () => {
      const { getByLabelText: getByLabelTextLocal } = render(
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
      getByLabelText = getByLabelTextLocal;
    });

    fireEvent.click(getByLabelText('Show notifications count in tray'), {
      target: { checked: false },
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith(
      'showNotificationsCountInTray',
      true,
    );
  });

  it('should toggle the markAsDoneOnOpen checkbox', async () => {
    let getByLabelText;

    await act(async () => {
      const { getByLabelText: getByLabelTextLocal } = render(
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
      getByLabelText = getByLabelTextLocal;
    });

    fireEvent.click(getByLabelText('Mark as done on open'), {
      target: { checked: true },
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('markAsDoneOnOpen', false);
  });

  it('should toggle the openAtStartup checkbox', async () => {
    let getByLabelText;

    await act(async () => {
      const { getByLabelText: getByLabelTextLocal } = render(
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
      getByLabelText = getByLabelTextLocal;
    });

    fireEvent.click(getByLabelText('Open at startup'), {
      target: { checked: true },
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('openAtStartup', false);
  });

  it('should change the appearance radio group', async () => {
    let getByLabelText;

    await act(async () => {
      const { getByLabelText: getByLabelTextLocal } = render(
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
      getByLabelText = getByLabelTextLocal;
    });

    fireEvent.click(getByLabelText('Light'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('appearance', 'LIGHT');
  });

  it('should go to the enterprise login route', async () => {
    let getByTitle;

    await act(async () => {
      const { getByTitle: getByTitleLocal } = render(
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
      getByTitle = getByTitleLocal;
    });

    fireEvent.click(getByTitle('Login with GitHub Enterprise'));
    expect(mockNavigate).toHaveBeenNthCalledWith(1, '/login-enterprise', {
      replace: true,
    });
  });

  it('should quit the app', async () => {
    let getByTitle;

    await act(async () => {
      const { getByTitle: getByTitleLocal } = render(
        <AppContext.Provider
          value={{ settings: mockSettings, accounts: mockAccounts }}
        >
          <MemoryRouter>
            <SettingsRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );
      getByTitle = getByTitleLocal;
    });

    fireEvent.click(getByTitle('Quit Gitify'));
    expect(ipcRenderer.send).toHaveBeenCalledWith('app-quit');
  });

  it('should be able to enable colors', async () => {
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

    await screen.findByLabelText('Use GitHub-like state colors');

    fireEvent.click(screen.getByLabelText('Use GitHub-like state colors'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('colors', true);
  });

  it('should not be able to enable colors due to missing scope', async () => {
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
        .getByLabelText('Use GitHub-like state colors (requires repo scope)')
        .closest('input'),
    ).toHaveProperty('disabled', true);

    // click the checkbox
    fireEvent.click(
      screen.getByLabelText(
        'Use GitHub-like state colors (requires repo scope)',
      ),
    );

    // check if the checkbox is still unchecked
    expect(updateSetting).not.toHaveBeenCalled();
    expect(
      screen.getByLabelText(
        'Use GitHub-like state colors (requires repo scope)',
      ),
    ).not.toBe('checked');

    expect(
      screen.getByLabelText(
        'Use GitHub-like state colors (requires repo scope)',
      ).parentNode.parentNode,
    ).toMatchSnapshot();
  });

  it('should open release notes', async () => {
    let getByTitle;

    await act(async () => {
      const { getByTitle: getByTitleLocal } = render(
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
      getByTitle = getByTitleLocal;
    });

    fireEvent.click(getByTitle('View release notes'));
    expect(shell.openExternal).toHaveBeenCalledTimes(1);
    expect(shell.openExternal).toHaveBeenCalledWith(
      'https://github.com/gitify-app/gitify/releases/tag/v0.0.1',
    );
  });
});
