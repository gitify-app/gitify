import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const { shell, ipcRenderer } = require('electron');

import { AuthState } from '../types';
import { mapStateToProps } from '../js/components/loading';
import { mockedEnterpriseAccounts } from '../js/__mocks__/mockedData';
import { Sidebar } from './sidebar';

describe('components/Sidebar.tsx', () => {
  let clock;

  const props = {
    isEitherLoggedIn: true,
    connectedAccounts: 2,
    notificationsCount: 4,
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
    props.history.goBack.mockReset();
    props.history.push.mockReset();
  });

  afterEach(() => {
    clock.clearAllTimers();
  });

  it('should render itself & its children (logged in)', () => {
    const tree = TestRenderer.create(
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>
    );
    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children (logged out)', function () {
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

  it('should load notifications after 60000ms', function () {
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
    const { getByLabelText } = render(
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>
    );
    props.fetchNotifications.mockReset();
    fireEvent.click(getByLabelText('Refresh Notifications'));
    expect(props.fetchNotifications).toHaveBeenCalledTimes(1);
  });

  it('go to the settings route', () => {
    const { getByLabelText } = render(
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>
    );
    fireEvent.click(getByLabelText('Settings'));
    expect(props.history.push).toHaveBeenCalledTimes(1);
  });

  it('go to back to home from the settings route', () => {
    const caseProps = {
      ...props,
      location: {
        pathname: '/settings',
      },
    };
    const { getByLabelText } = render(
      <MemoryRouter>
        <Sidebar {...caseProps} />
      </MemoryRouter>
    );
    fireEvent.click(getByLabelText('Settings'));
    expect(props.history.goBack).toHaveBeenCalledTimes(1);
  });

  it('open the gitify repo in browser', () => {
    const { getByLabelText } = render(
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>
    );
    fireEvent.click(getByLabelText('View project on GitHub'));
    expect(shell.openExternal).toHaveBeenCalledTimes(1);
  });
});
