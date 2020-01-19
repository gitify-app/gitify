import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const { shell, ipcRenderer } = require('electron');

import { Sidebar, mapStateToProps } from './sidebar';
import {
  mockedEnterpriseAccounts,
  mockedNotificationsRecuderData,
} from '../__mocks__/mockedData';
import { AuthState, AppState, SettingsState } from '../../types/reducers';

describe('components/Sidebar.tsx', () => {
  let clock;

  const props = {
    isFetching: false,
    isGitHubLoggedIn: true,
    isEitherLoggedIn: true,
    connectedAccounts: 2,
    enterpriseAccounts: mockedEnterpriseAccounts,
    notifications: mockedNotificationsRecuderData,
    notificationsCount: 4,
    hasStarred: false,
    fetchNotifications: jest.fn(),
    history: {
      goBack: jest.fn(),
      push: jest.fn(),
    },
    location: {
      pathname: '/',
    },
  };

  beforeEach(() => {
    clock = jest.useFakeTimers();

    spyOn(ipcRenderer, 'send');
    spyOn(shell, 'openExternal');
    spyOn(window, 'clearInterval');

    props.fetchNotifications.mockReset();
    props.history.push.mockReset();
  });

  afterEach(() => {
    clock.clearAllTimers();
  });

  it('should test the mapStateToProps method', () => {
    const state = {
      auth: {
        token: '12345',
        enterpriseAccounts: mockedEnterpriseAccounts,
      } as AuthState,
      notifications: {
        response: [],
      },
    } as AppState;

    const mappedProps = mapStateToProps(state);

    expect(mappedProps.isGitHubLoggedIn).toBeTruthy();
    expect(mappedProps.isEitherLoggedIn).toBeTruthy();
    expect(mappedProps.notifications).toBeDefined();
  });

  it('should render itself & its children (logged in)', () => {
    const tree = TestRenderer.create(
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>
    );
    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children (logged out)', function() {
    const caseProps = {
      ...props,
      notifications: [],
      enterpriseAccounts: [],
      isGitHubLoggedIn: false,
      isEitherLoggedIn: false,
    };
    const tree = TestRenderer.create(
      <MemoryRouter>
        <Sidebar {...caseProps} />
      </MemoryRouter>
    );
    expect(tree).toMatchSnapshot();
  });

  it('should clear the interval when unmounting', () => {
    spyOn(Sidebar.prototype, 'componentDidMount').and.callThrough();

    const { unmount } = render(
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>
    );

    expect(Sidebar.prototype.componentDidMount).toHaveBeenCalledTimes(1);
    unmount();
    expect(window.clearInterval).toHaveBeenCalledTimes(1);
  });

  it('should load notifications after 60000ms', function() {
    const {} = render(
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>
    );

    expect(props.fetchNotifications).toHaveBeenCalledTimes(1);
    clock.runTimersToTime(60000);
    expect(props.fetchNotifications).toHaveBeenCalledTimes(2);
    clock.runTimersToTime(60000);
    expect(props.fetchNotifications).toHaveBeenCalledTimes(3);
  });

  it('should fetch the notifications if another account logs in', () => {
    const { rerender } = render(
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>
    );

    props.fetchNotifications.mockReset();

    rerender(
      <MemoryRouter>
        <Sidebar {...props} connectedAccounts={props.connectedAccounts + 1} />
      </MemoryRouter>
    );

    expect(props.fetchNotifications).toHaveBeenCalledTimes(1);
  });

  it('should refresh the notifications', () => {
    const { getByTitle } = render(
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>
    );
    props.fetchNotifications.mockReset();
    fireEvent.click(getByTitle('Refresh'));
    expect(props.fetchNotifications).toHaveBeenCalledTimes(1);
  });

  it('should go to the enterprise login route', () => {
    const { debug, getByLabelText } = render(
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>
    );
    fireEvent.click(getByLabelText('Login with GitHub Enterprise'));
    expect(props.history.push).toHaveBeenCalledTimes(1);
  });

  it('open the gitify repo in browser', () => {
    const { debug, getByLabelText } = render(
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>
    );
    fireEvent.click(getByLabelText('Star on GitHub'));
    expect(shell.openExternal).toHaveBeenCalledTimes(1);
  });
});
