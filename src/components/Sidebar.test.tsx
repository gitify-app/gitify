import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { fireEvent, render } from '@testing-library/react';
import { Router } from 'react-router';
import { MemoryRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';

const { shell, ipcRenderer } = require('electron');

import { Sidebar } from './sidebar';
import { mockSettings } from '../__mocks__/mock-state';
import { AppContext } from '../context/App';
import { NotificationsContext } from '../context/Notifications';
import { mockedAccountNotifications } from '../__mocks__/mockedData';

describe('components/Sidebar.tsx', () => {
  const fetchNotifications = jest.fn();
  const history = createMemoryHistory();

  beforeEach(() => {
    fetchNotifications.mockReset();

    spyOn(ipcRenderer, 'send');
    spyOn(shell, 'openExternal');
    spyOn(window, 'clearInterval');
  });

  it('should render itself & its children (logged in)', () => {
    const tree = TestRenderer.create(
      <AppContext.Provider value={{ settings: { ...mockSettings } }}>
        <NotificationsContext.Provider
          value={{ notifications: mockedAccountNotifications }}
        >
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </NotificationsContext.Provider>
      </AppContext.Provider>
    );
    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children (logged out)', () => {
    const tree = TestRenderer.create(
      <AppContext.Provider value={{ isLoggedIn: false }}>
        <NotificationsContext.Provider
          value={{ notifications: mockedAccountNotifications }}
        >
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </NotificationsContext.Provider>
      </AppContext.Provider>
    );
    expect(tree).toMatchSnapshot();
  });

  it('should refresh the notifications', () => {
    const { getByLabelText } = render(
      <AppContext.Provider value={{ isLoggedIn: true }}>
        <NotificationsContext.Provider
          value={{ notifications: [], fetchNotifications }}
        >
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </NotificationsContext.Provider>
      </AppContext.Provider>
    );
    fetchNotifications.mockReset();
    fireEvent.click(getByLabelText('Refresh Notifications'));
    expect(fetchNotifications).toHaveBeenCalledTimes(1);
  });

  it('go to the settings route', () => {
    const pushMock = jest.spyOn(history, 'push');

    const { getByLabelText } = render(
      <AppContext.Provider value={{ isLoggedIn: true }}>
        <NotificationsContext.Provider value={{ notifications: [] }}>
          <Router history={history}>
            <Sidebar />
          </Router>
        </NotificationsContext.Provider>
      </AppContext.Provider>
    );
    fireEvent.click(getByLabelText('Settings'));
    expect(pushMock).toHaveBeenCalledTimes(1);
  });

  it('open the gitify repo in browser', () => {
    const { getByLabelText } = render(
      <AppContext.Provider value={{ isLoggedIn: true }}>
        <NotificationsContext.Provider value={{ notifications: [] }}>
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </NotificationsContext.Provider>
      </AppContext.Provider>
    );
    fireEvent.click(getByLabelText('View project on GitHub'));
    expect(shell.openExternal).toHaveBeenCalledTimes(1);
  });
});
