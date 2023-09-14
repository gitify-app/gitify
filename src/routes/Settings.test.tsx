import React from 'react';
import TestRenderer from 'react-test-renderer';
import { render, fireEvent } from '@testing-library/react';
import { Router } from 'react-router';
import { MemoryRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';

const { ipcRenderer } = require('electron');

import { SettingsRoute } from './Settings';
import { AppContext } from '../context/App';
import { mockSettings } from '../__mocks__/mock-state';

describe('routes/Settings.tsx', () => {
  const history = createMemoryHistory();
  const goBackMock = jest.spyOn(history, 'goBack');
  const replaceMock = jest.spyOn(history, 'replace');
  const updateSetting = jest.fn();

  beforeEach(() => {
    goBackMock.mockReset();
    updateSetting.mockReset();
  });

  it('should render itself & its children', () => {
    const tree = TestRenderer.create(
      <AppContext.Provider value={{ settings: mockSettings }}>
        <MemoryRouter>
          <SettingsRoute />
        </MemoryRouter>
      </AppContext.Provider>
    );
    expect(tree).toMatchSnapshot();
  });

  it('should press the logout', () => {
    const logoutMock = jest.fn();

    const { getByLabelText } = render(
      <AppContext.Provider
        value={{ settings: mockSettings, logout: logoutMock }}
      >
        <Router history={history}>
          <SettingsRoute />
        </Router>
      </AppContext.Provider>
    );

    fireEvent.click(getByLabelText('Logout'));

    expect(logoutMock).toHaveBeenCalledTimes(1);

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('update-icon');
    expect(goBackMock).toHaveBeenCalledTimes(1);
  });

  it('should go back by pressing the icon', () => {
    const { getByLabelText } = render(
      <AppContext.Provider value={{ settings: mockSettings }}>
        <Router history={history}>
          <SettingsRoute />
        </Router>
      </AppContext.Provider>
    );
    fireEvent.click(getByLabelText('Go Back'));
    expect(goBackMock).toHaveBeenCalledTimes(1);
  });

  it('should toggle the showOnlyParticipating checkbox', () => {
    const { getByLabelText } = render(
      <AppContext.Provider value={{ settings: mockSettings, updateSetting }}>
        <MemoryRouter>
          <SettingsRoute />
        </MemoryRouter>
      </AppContext.Provider>
    );

    fireEvent.click(getByLabelText('Show only participating'), {
      target: { checked: true },
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('participating', false);
  });

  it('should toggle the playSound checkbox', () => {
    const { getByLabelText } = render(
      <AppContext.Provider value={{ settings: mockSettings, updateSetting }}>
        <MemoryRouter>
          <SettingsRoute />
        </MemoryRouter>
      </AppContext.Provider>
    );

    fireEvent.click(getByLabelText('Play sound'), {
      target: { checked: true },
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('playSound', false);
  });

  it('should toggle the showNotifications checkbox', () => {
    const { getByLabelText } = render(
      <AppContext.Provider value={{ settings: mockSettings, updateSetting }}>
        <MemoryRouter>
          <SettingsRoute />
        </MemoryRouter>
      </AppContext.Provider>
    );

    fireEvent.click(getByLabelText('Show notifications'), {
      target: { checked: true },
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('showNotifications', false);
  });

  it('should toggle the onClickMarkAsRead checkbox', () => {
    const { getByLabelText } = render(
      <AppContext.Provider value={{ settings: mockSettings, updateSetting }}>
        <MemoryRouter>
          <SettingsRoute />
        </MemoryRouter>
      </AppContext.Provider>
    );

    fireEvent.click(getByLabelText('Mark as read on click'), {
      target: { checked: true },
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('markOnClick', false);
  });

  it('should toggle the openAtStartup checkbox', () => {
    const { getByLabelText } = render(
      <AppContext.Provider value={{ settings: mockSettings, updateSetting }}>
        <MemoryRouter>
          <SettingsRoute />
        </MemoryRouter>
      </AppContext.Provider>
    );

    fireEvent.click(getByLabelText('Open at startup'), {
      target: { checked: true },
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('openAtStartup', false);
  });

  it('should change the appearance radio group', () => {
    const { getByLabelText } = render(
      <AppContext.Provider value={{ settings: mockSettings, updateSetting }}>
        <MemoryRouter>
          <SettingsRoute />
        </MemoryRouter>
      </AppContext.Provider>
    );

    fireEvent.click(getByLabelText('Light'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('appearance', 'LIGHT');
  });

  it('should go to the enterprise login route', () => {
    const { getByLabelText } = render(
      <AppContext.Provider value={{ settings: mockSettings }}>
        <Router history={history}>
          <SettingsRoute />
        </Router>
      </AppContext.Provider>
    );
    fireEvent.click(getByLabelText('Login with GitHub Enterprise'));
    expect(replaceMock).toHaveBeenCalledWith('/login-enterprise');
  });

  it('should quit the app', () => {
    const { getByLabelText } = render(
      <AppContext.Provider value={{ settings: mockSettings }}>
        <MemoryRouter>
          <SettingsRoute />
        </MemoryRouter>
      </AppContext.Provider>
    );
    fireEvent.click(getByLabelText('Quit Gitify'));
    expect(ipcRenderer.send).toHaveBeenCalledWith('app-quit');
  });
});
