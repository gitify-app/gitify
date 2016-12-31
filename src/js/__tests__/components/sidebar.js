import React from 'react'; // eslint-disable-line no-unused-vars
import { fromJS } from 'immutable';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { List } from 'immutable';
import sinon from 'sinon';

const ipcRenderer = window.require('electron').ipcRenderer;
const shell = window.require('electron').shell;

import { Sidebar } from '../../components/sidebar';

function setup(props) {
  const options = {
    context: {
      router: {
        push: sinon.spy(),
        replace: sinon.spy()
      }
    }
  };

  const wrapper = mount(<Sidebar {...props} />, options);

  return {
    context: options.context,
    props: props,
    wrapper: wrapper,
  };
};

describe('components/Sidebar.js', () => {

  const notifications = fromJS([{ id: 1 }, { id: 2 }]);

  beforeEach(function() {
    this.clock = sinon.useFakeTimers();

    ipcRenderer.send.reset();
    shell.openExternal.reset();
  });

  afterEach(function() {
    this.clock = sinon.restore();
  });

  it('should render itself & its children (logged in)', () => {
    const props = {
      isFetching: false,
      notifications: notifications,
      isLoggedIn: true,
    };

    sinon.spy(Sidebar.prototype, 'componentDidMount');

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(Sidebar.prototype.componentDidMount).to.have.been.calledOnce;
    expect(wrapper.find('.fa-refresh').length).to.equal(1);
    expect(wrapper.find('.fa-cog').length).to.equal(1);
    expect(wrapper.find('.tag-count').text()).to.equal(`${notifications.size} Unread`);

    Sidebar.prototype.componentDidMount.restore();

  });

  it('should load notifications after 60000ms', function () {

    const props = {
      isFetching: false,
      notifications: notifications,
      fetchNotifications: sinon.spy(),
      isLoggedIn: 'true',
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;

    this.clock.tick(60000);
    expect(props.fetchNotifications).to.have.been.calledOnce;

  });

  it('should render itself & its children (logged out)', function () {

    const props = {
      isFetching: false,
      notifications: List(),
      isLoggedIn: false,
    };

    sinon.spy(Sidebar.prototype, 'componentDidMount');

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(Sidebar.prototype.componentDidMount).to.have.been.calledOnce;
    expect(wrapper.find('.fa-refresh').length).to.equal(0);
    expect(wrapper.find('.fa-cog').length).to.equal(0);
    expect(wrapper.find('.tag-success').length).to.equal(0);

    Sidebar.prototype.componentDidMount.restore();

  });

  it('should render itself & its children (logged in/settings page)', () => {

    const props = {
      isFetching: false,
      notifications: notifications,
      isLoggedIn: true,
    };

    sinon.spy(Sidebar.prototype, 'componentDidMount');

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(Sidebar.prototype.componentDidMount).to.have.been.calledOnce;
    expect(wrapper.find('.fa-refresh').length).to.equal(1);
    expect(wrapper.find('.fa-cog').length).to.equal(1);
    expect(wrapper.find('.tag-count').text()).to.equal(`${notifications.size} Unread`);

    Sidebar.prototype.componentDidMount.restore();

  });

  it('should open the gitify repo in browser', () => {

    const props = {
      isFetching: false,
      notifications: List(),
      isLoggedIn: false
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;

    wrapper.find('.logo').simulate('click');

    expect(shell.openExternal).to.have.been.calledOnce;
    expect(shell.openExternal).to.have.been.calledWith('http://www.github.com/manosim/gitify');

  });

  it('should toggle the settings modal', () => {

    const props = {
      isFetching: false,
      notifications: notifications,
      isLoggedIn: 'true',
      toggleSettingsModal: sinon.spy(),
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(wrapper.find('.fa-cog').length).to.equal(1);

    wrapper.find('.fa-cog').simulate('click');

    expect(props.toggleSettingsModal).to.have.been.calledOnce;

    props.toggleSettingsModal.reset();

  });

  it('should refresh the notifications', () => {

    const props = {
      fetchNotifications: sinon.spy(),
      isFetching: false,
      notifications: notifications,
      isLoggedIn: 'true',
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(wrapper.find('.fa-refresh').length).to.equal(1);

    wrapper.find('.fa-refresh').simulate('click');
    expect(props.fetchNotifications).to.have.been.calledOnce;

  });

  it('open the gitify repo in browser', () => {

    const props = {
      hasStarred: false,
      notifications: notifications,
    };

    const { wrapper } = setup(props);

    expect(wrapper.find('.btn-star').length).to.equal(1);

    wrapper.find('.btn-star').simulate('click');
    expect(shell.openExternal).to.have.been.calledOnce;
    shell.openExternal.reset();

  });
});
