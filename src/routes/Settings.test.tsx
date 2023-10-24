import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const { ipcRenderer } = require('electron');

import { SettingsRoute } from './Settings';
import { AppContext } from '../context/App';
import { mockSettings } from '../__mocks__/mock-state';

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
        <AppContext.Provider value={{ settings: mockSettings }}>
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
          value={{ settings: mockSettings, logout: logoutMock }}
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
        <AppContext.Provider value={{ settings: mockSettings }}>
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
        <AppContext.Provider value={{ settings: mockSettings, updateSetting }}>
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
        <AppContext.Provider value={{ settings: mockSettings, updateSetting }}>
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
        <AppContext.Provider value={{ settings: mockSettings, updateSetting }}>
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
        <AppContext.Provider value={{ settings: mockSettings, updateSetting }}>
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
        <AppContext.Provider value={{ settings: mockSettings, updateSetting }}>
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
        <AppContext.Provider value={{ settings: mockSettings, updateSetting }}>
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
        <AppContext.Provider value={{ settings: mockSettings }}>
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
        <AppContext.Provider value={{ settings: mockSettings }}>
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
});
