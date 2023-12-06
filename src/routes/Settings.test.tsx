import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const { ipcRenderer } = require('electron');

import { SettingsRoute } from './Settings';
import { AppContext } from '../context/App';
import { mockAccounts, mockSettings } from '../__mocks__/mock-state';
import Constants from '../utils/constants';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('routes/Settings.tsx', () => {
  const updateSetting = jest.fn();

  beforeEach(() => {
    mockNavigate.mockReset();
    updateSetting.mockReset();
  });

  it('should render itself & its children', async () => {
    let tree: TestRenderer;

    await act(async () => {
      tree = TestRenderer.create(
        <AppContext.Provider
          value={{ settings: mockSettings, accounts: mockAccounts }}
        >
          <MemoryRouter>
            <SettingsRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });
    expect(tree).toMatchSnapshot();
  });

  it('should press the logout', async () => {
    const logoutMock = jest.fn();
    let getByLabelText;

    await act(async () => {
      const { getByLabelText: getByLabelTextLocal } = render(
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

      getByLabelText = getByLabelTextLocal;
    });

    fireEvent.click(getByLabelText('Logout'));

    expect(logoutMock).toHaveBeenCalledTimes(1);

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('update-icon');
    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
  });

  it('should go back by pressing the icon', async () => {
    let getByLabelText;

    await act(async () => {
      const { getByLabelText: getByLabelTextLocal } = render(
        <AppContext.Provider value={{ settings: mockSettings, accounts: mockAccounts }}>
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

  it('should toggle the onClickMarkAsRead checkbox', async () => {
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

    fireEvent.click(getByLabelText('Mark as read on click'), {
      target: { checked: true },
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('markOnClick', false);
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
    let getByLabelText;

    await act(async () => {
      const { getByLabelText: getByLabelTextLocal } = render(
        <AppContext.Provider value={{ settings: mockSettings, accounts: mockAccounts }}>
          <MemoryRouter>
            <SettingsRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );
      getByLabelText = getByLabelTextLocal;
    });

    fireEvent.click(getByLabelText('Login with GitHub Enterprise'));
    expect(mockNavigate).toHaveBeenNthCalledWith(1, '/login-enterprise', {
      replace: true,
    });
  });

  it('should quit the app', async () => {
    let getByLabelText;

    await act(async () => {
      const { getByLabelText: getByLabelTextLocal } = render(
        <AppContext.Provider
          value={{ settings: mockSettings, accounts: mockAccounts }}
        >
          <MemoryRouter>
            <SettingsRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );
      getByLabelText = getByLabelTextLocal;
    });

    fireEvent.click(getByLabelText('Quit Gitify'));
    expect(ipcRenderer.send).toHaveBeenCalledWith('app-quit');
  });

  it('should be able to enable colors', async () => {
    let getByLabelText;
    jest.mock('../utils/api-requests', () => ({
      ...jest.requireActual('../utils/api-requests'),
      apiRequestAuth: jest.fn().mockResolvedValue({
        headers: {
          'x-oauth-scopes': Constants.AUTH_SCOPE.join(', '),
          'access-control-allow-headers': 'Authorization',
          'access-control-allow-origin': '*',
          'access-control-expose-headers': 'X-OAuth-Scopes',
          'cache-control': 'private, max-age=60, s-maxage=60',
          'content-encoding': 'gzip',
          'content-security-policy': "default-src 'none'",
          'content-type': 'application/json; charset=utf-8',
          server: 'GitHub.com',
          'strict-transport-security':
            'max-age=31536000; includeSubdomains; preload',
          vary: 'Accept, Authorization, Cookie, X-GitHub-OTP, Accept-Encoding, Accept, X-Requested-With',
        },
      }),
    }));
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

    // await act(async () => {
    //   expect(getByLabelText('Use GitHub-like state colors')).toBeDefined();
    // });

    // await act(async () => {
    await act(
      () =>
        // waitFor(() =>
        fireEvent.click(getByLabelText('Use GitHub-like state colors')),
      // ),
    );

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('colors', true);
  });

  it('should not be able to disable colors', async () => {
    let queryByLabelText;
    jest.mock('../utils/helpers', () => ({
      ...jest.requireActual('../utils/helpers'),
      apiRequestAuth: jest.fn().mockResolvedValue({
        headers: {
          'x-oauth-scopes': 'repo, notifications',
        },
      }),
    }));

    await act(async () => {
      const { queryByLabelText: queryByLabelLocal } = render(
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
      queryByLabelText = queryByLabelLocal;
    });

    console.log(
      queryByLabelText('Use GitHub-like state colors (requires re-auth)'),
    );

    expect(
      queryByLabelText('Use GitHub-like state colors (requires re-auth)'),
    ).toBeDefined();
  });
});
