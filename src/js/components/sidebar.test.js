import React from 'react'; // eslint-disable-line no-unused-vars
import { MemoryRouter } from 'react-router-dom';
import { fromJS, List, Map } from 'immutable';
import { shallow, mount } from 'enzyme';

const { shell, ipcRenderer } = require('electron');

import { Sidebar, mapStateToProps } from './sidebar';
import {
  mockedEnterpriseAccounts,
  mockedNotificationsRecuderData,
} from './../__mocks__/mockedData';

jest.mock('./logos/white');

describe('components/Sidebar.js', () => {
  let clock;
  const props = {
    isFetching: false,
    isGitHubLoggedIn: true,
    isEitherLoggedIn: true,
    connectedAccounts: 2,
    enterpriseAccounts: mockedEnterpriseAccounts,
    notifications: mockedNotificationsRecuderData,
    hasStarred: false,
    fetchNotifications: jest.fn(),
    toggleSettingsModal: jest.fn(),
  };

  const notifications = fromJS([{ id: 1 }, { id: 2 }]);

  beforeEach(() => {
    clock = jest.useFakeTimers();
    ipcRenderer.send.mockReset();
    shell.openExternal.mockReset();
    window.clearInterval.mockReset();

    props.fetchNotifications.mockReset();
    props.toggleSettingsModal.mockReset();
  });

  afterEach(() => {
    clock.clearAllTimers();
  });

  it('should test the mapStateToProps method', () => {
    const state = {
      auth: Map({
        token: '12345',
        enterpriseAccounts: mockedEnterpriseAccounts,
      }),
      notifications: Map({
        response: List(),
      }),
      settings: Map({
        hasStarred: true,
      }),
    };

    const mappedProps = mapStateToProps(state);

    expect(mappedProps.isGitHubLoggedIn).toBeTruthy();
    expect(mappedProps.isEitherLoggedIn).toBeTruthy();
    expect(mappedProps.notifications).toBeDefined();
    expect(mappedProps.hasStarred).toBeTruthy();
  });

  it('should render itself & its children (logged in)', () => {
    const wrapper = mount(
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>
    );

    expect(wrapper).toBeDefined();
    expect(wrapper.find('.octicon.octicon-sync').length).toBe(1);
    expect(wrapper.find('.octicon.octicon-gear').length).toBe(1);

    expect(
      wrapper.find('.badge-account').first().children().first().text()
    ).toBe('GitHub');
    expect(
      wrapper.find('.badge-account').first().children().last().text()
    ).toBe(`${notifications.size}`);
    expect(
      wrapper.find('.badge-account').last().children().first().text()
    ).toBe('gitify');
    expect(wrapper.find('.badge-account').last().children().last().text()).toBe(
      `${notifications.size}`
    );
  });

  it('should clear the interval when unmounting', () => {
    spyOn(Sidebar.prototype, 'componentDidMount').and.callThrough();

    const wrapper = mount(
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>
    );

    expect(wrapper).toBeDefined();
    expect(Sidebar.prototype.componentDidMount).toHaveBeenCalledTimes(1);

    wrapper.unmount();
    expect(window.clearInterval).toHaveBeenCalledTimes(1);
  });

  it('should load notifications after 60000ms', function() {
    const wrapper = shallow(<Sidebar {...props} />);

    expect(wrapper).toBeDefined();

    wrapper.instance().componentDidMount();
    clock.runTimersToTime(60000);
    expect(props.fetchNotifications).toHaveBeenCalledTimes(1);
  });

  it('should render itself & its children (logged out)', function() {
    const caseProps = {
      ...props,
      notifications: List(),
      isGitHubLoggedIn: false,
      isEitherLoggedIn: false,
    };

    const wrapper = mount(
      <MemoryRouter>
        <Sidebar {...caseProps} />
      </MemoryRouter>
    );

    expect(wrapper).toBeDefined();
    expect(wrapper.find('.octicon.octicon-sync').length).toBe(0);
    expect(wrapper.find('.octicon.octicon-gear').length).toBe(0);
    expect(wrapper.find('.tag-success').length).toBe(0);
  });

  it('should mount itself & its children (logged out)', function() {
    const caseProps = {
      ...props,
      notifications: List(),
      isGitHubLoggedIn: false,
      isEitherLoggedIn: false,
    };

    spyOn(Sidebar.prototype, 'componentDidMount').and.callThrough();

    const wrapper = mount(
      <MemoryRouter>
        <Sidebar {...caseProps} />
      </MemoryRouter>
    );

    expect(wrapper).toBeDefined();
    expect(Sidebar.prototype.componentDidMount).toHaveBeenCalledTimes(1);
    expect(wrapper.find('.octicon.octicon-sync').length).toBe(0);
    expect(wrapper.find('.octicon.octicon-gear').length).toBe(0);
    expect(wrapper.find('.tag-success').length).toBe(0);
  });

  it('should fetch the notifications if another account logs in', () => {
    const wrapper = shallow(<Sidebar {...props} />);

    expect(wrapper).toBeDefined();
    expect(props.fetchNotifications).toHaveBeenCalledTimes(0);

    wrapper.setProps({
      ...props,
      connectedAccounts: props.connectedAccounts + 1,
    });

    expect(props.fetchNotifications).toHaveBeenCalledTimes(1);
  });

  it('should toggle the settings modal', () => {
    const wrapper = mount(
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>
    );

    expect(wrapper).toBeDefined();
    expect(wrapper.find('.octicon.octicon-gear').length).toBe(1);

    wrapper.find('.octicon.octicon-gear').simulate('click');

    expect(props.toggleSettingsModal).toHaveBeenCalledTimes(1);
  });

  it('should refresh the notifications', () => {
    const wrapper = mount(
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>
    );

    expect(wrapper).toBeDefined();
    expect(wrapper.find('.octicon.octicon-sync').length).toBe(1);

    wrapper.find('.octicon.octicon-sync').simulate('click');
    expect(props.fetchNotifications).toHaveBeenCalledTimes(1);
  });

  it('open the gitify repo in browser', () => {
    const wrapper = shallow(<Sidebar {...props} />);

    expect(wrapper.find('.btn-star').length).toBe(1);

    wrapper.find('.btn-star').simulate('click');
    expect(shell.openExternal).toHaveBeenCalledTimes(1);
  });
});
