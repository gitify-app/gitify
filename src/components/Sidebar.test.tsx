import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { fireEvent, render } from '@testing-library/react';
import { Router } from 'react-router';
import { MemoryRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';

const { shell, ipcRenderer } = require('electron');

import { Sidebar } from './Sidebar';
import { mockSettings } from '../__mocks__/mock-state';
import { AppContext } from '../context/App';
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

  it('open the gitify repo in browser', () => {
    const { getByLabelText } = render(
      <AppContext.Provider value={{ isLoggedIn: true, notifications: [] }}>
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>
    );
    fireEvent.click(getByLabelText('View project on GitHub'));
    expect(shell.openExternal).toHaveBeenCalledTimes(1);
  });
});
