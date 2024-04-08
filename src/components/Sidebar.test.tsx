import { fireEvent, render, screen } from '@testing-library/react';

import { MemoryRouter } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';

const { shell, ipcRenderer } = require('electron');

import { mockSettings } from '../__mocks__/mock-state';
import { mockedAccountNotifications } from '../__mocks__/mockedData';
import { AppContext } from '../context/App';
import { Sidebar } from './Sidebar';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('components/Sidebar.tsx', () => {
  const fetchNotifications = jest.fn();

  beforeEach(() => {
    fetchNotifications.mockReset();

    jest.spyOn(ipcRenderer, 'send');
    jest.spyOn(shell, 'openExternal');
    jest.spyOn(window, 'clearInterval');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render itself & its children (logged in)', () => {
    const tree = TestRenderer.create(
      <AppContext.Provider
        value={{
          settings: mockSettings,
          notifications: mockedAccountNotifications,
        }}
      >
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>,
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
      </AppContext.Provider>,
    );
    expect(tree).toMatchSnapshot();
  });

  it('should refresh the notifications', () => {
    const { getByTitle } = render(
      <AppContext.Provider
        value={{ isLoggedIn: true, notifications: [], fetchNotifications }}
      >
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>,
    );
    fetchNotifications.mockReset();
    fireEvent.click(getByTitle('Refresh Notifications'));
    expect(fetchNotifications).toHaveBeenCalledTimes(1);
  });

  it('go to the settings route', () => {
    const { getByTitle } = render(
      <AppContext.Provider value={{ isLoggedIn: true, notifications: [] }}>
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>,
    );
    fireEvent.click(getByTitle('Settings'));
    expect(mockNavigate).toHaveBeenNthCalledWith(1, '/settings');
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
      </AppContext.Provider>,
    );
    fireEvent.click(getByLabelText('4 Unread Notifications'));
    expect(shell.openExternal).toHaveBeenCalledTimes(1);
    expect(shell.openExternal).toHaveBeenCalledWith(
      'https://github.com/notifications',
    );
  });

  it('should quit the app', () => {
    const { getByTitle } = render(
      <AppContext.Provider value={{ isLoggedIn: false, notifications: [] }}>
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>,
    );
    fireEvent.click(getByTitle('Quit Gitify'));
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('app-quit');
  });

  it('should open the gitify repository', () => {
    render(
      <AppContext.Provider value={{ isLoggedIn: false, notifications: [] }}>
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AppContext.Provider>,
    );
    fireEvent.click(screen.getByTestId('gitify-logo'));
    expect(shell.openExternal).toHaveBeenCalledTimes(1);
    expect(shell.openExternal).toHaveBeenCalledWith(
      'https://github.com/gitify-app/gitify',
    );
  });

  describe('should render the notifications icon', () => {
    it('when there are 0 notifications', () => {
      const { getByTitle } = render(
        <AppContext.Provider value={{ isLoggedIn: true, notifications: [] }}>
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      const notificationsIcon = getByTitle('0 Unread Notifications');
      expect(notificationsIcon.className).toContain('text-white');
      expect(notificationsIcon.childNodes.length).toBe(1);
      expect(notificationsIcon.childNodes[0].nodeName).toBe('svg');
    });

    it('when there are more than 0 notifications', () => {
      const { getByTitle } = render(
        <AppContext.Provider
          value={{
            isLoggedIn: true,
            notifications: mockedAccountNotifications,
          }}
        >
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      const notificationsIcon = getByTitle('4 Unread Notifications');
      expect(notificationsIcon.className).toContain('text-green-500');
      expect(notificationsIcon.childNodes.length).toBe(2);
      expect(notificationsIcon.childNodes[0].nodeName).toBe('svg');
      expect(notificationsIcon.childNodes[1].nodeValue).toBe('4');
    });
  });
});
