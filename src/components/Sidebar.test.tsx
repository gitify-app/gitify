import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import * as React from 'react';
import { Router } from 'react-router';
import { MemoryRouter } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';

const { shell, ipcRenderer } = require('electron');

import { mockSettings } from '../__mocks__/mock-state';
import { mockedAccountNotifications } from '../__mocks__/mockedData';
import { AppContext } from '../context/App';
import { Sidebar } from './Sidebar';

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
      <AppContext.Provider
        value={{
          settings: { ...mockSettings },
          notifications: mockedAccountNotifications,
        }}
      >
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>
    );
    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children (logged out)', () => {
    const tree = TestRenderer.create(
      <AppContext.Provider
        value={{ isLoggedIn: false, notifications: mockedAccountNotifications }}
      >
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>
    );
    expect(tree).toMatchSnapshot();
  });

  it('should refresh the notifications', () => {
    const { getByLabelText } = render(
      <AppContext.Provider
        value={{ isLoggedIn: true, notifications: [], fetchNotifications }}
      >
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>
    );
    fetchNotifications.mockReset();
    fireEvent.click(getByLabelText('Refresh Notifications'));
    expect(fetchNotifications).toHaveBeenCalledTimes(1);
  });

  it('go to the settings route', () => {
    const pushMock = jest.spyOn(history, 'push');

    const { getByLabelText } = render(
      <AppContext.Provider value={{ isLoggedIn: true, notifications: [] }}>
        <Router history={history}>
          <Sidebar />
        </Router>
      </AppContext.Provider>
    );
    fireEvent.click(getByLabelText('Settings'));
    expect(pushMock).toHaveBeenCalledTimes(1);
  });

  it('opens github in the notifications page', () => {
    const { getByLabelText } = render(
      <AppContext.Provider
        value={{
          isLoggedIn: true,
          notifications: mockedAccountNotifications,
        }}
      >
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>
    );
    fireEvent.click(getByLabelText('4 Unread Notifications'));
    expect(shell.openExternal).toHaveBeenCalledTimes(1);
    expect(shell.openExternal).toHaveBeenCalledWith(
      'https://github.com/notifications'
    );
  });

  it('should quit the app', () => {
    const { getByLabelText } = render(
      <AppContext.Provider value={{ isLoggedIn: false, notifications: [] }}>
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>
    );
    fireEvent.click(getByLabelText('Quit App'));
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('app-quit');
  });

  it('should open the gitify repository', () => {
    render(
      <AppContext.Provider value={{ isLoggedIn: false, notifications: [] }}>
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>
    );
    fireEvent.click(screen.getByTestId('gitify-logo'));
    expect(shell.openExternal).toHaveBeenCalledTimes(1);
    expect(shell.openExternal).toHaveBeenCalledWith(
      'https://github.com/gitify-app/gitify'
    );
  });

  describe('should render the notifications icon', () => {
    it('when there are 0 notifications', () => {
      const { getByLabelText } = render(
        <AppContext.Provider value={{ isLoggedIn: true, notifications: [] }}>
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>
      );

      const notificationsIcon = getByLabelText('0 Unread Notifications');
      expect(notificationsIcon.className).toContain('text-white');
      expect(notificationsIcon.childNodes.length).toBe(1);
      expect(notificationsIcon.childNodes[0].nodeName).toBe('svg');
    });

    it('when there are more than 0 notifications', () => {
      const { getByLabelText } = render(
        <AppContext.Provider
          value={{
            isLoggedIn: true,
            notifications: mockedAccountNotifications,
          }}
        >
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>
      );

      const notificationsIcon = getByLabelText('4 Unread Notifications');
      expect(notificationsIcon.className).toContain('text-green-500');
      expect(notificationsIcon.childNodes.length).toBe(2);
      expect(notificationsIcon.childNodes[0].nodeName).toBe('svg');
      expect(notificationsIcon.childNodes[1].nodeValue).toBe('4');
    });
  });
});
