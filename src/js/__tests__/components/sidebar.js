import React from 'react'; // eslint-disable-line no-unused-vars
import { fromJS } from 'immutable';
import { expect } from 'chai';
import { mount } from 'enzyme';
import sinon from 'sinon';

const ipcRenderer = window.require('electron').ipcRenderer;
const shell = window.require('electron').shell;

import { Sidebar } from '../../components/sidebar';

function setup(props) {
  const options = {
    context: {
      location: {
        pathname: ''
      },
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

describe('components/Sidebar.js', function () {

  const notifications = fromJS([{ id: 1 }, { id: 2 }]);

  beforeEach(function() {
    this.clock = sinon.useFakeTimers();

    ipcRenderer.send.reset();
    shell.openExternal.reset();
  });

  afterEach(function() {
    this.clock = sinon.restore();
  });

  it('should render itself & its children (logged in)', function () {
    const props = {
      isFetching: false,
      notifications: notifications,
      token: 'IMLOGGEDIN',
      location: {
        pathname: '/home'
      }
    };

    sinon.spy(Sidebar.prototype, 'componentDidMount');

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(Sidebar.prototype.componentDidMount).to.have.been.calledOnce;
    expect(wrapper.find('.fa-refresh').length).to.equal(1);
    expect(wrapper.find('.fa-refresh').first().hasClass('fa-spin')).to.be.false;
    expect(wrapper.find('.fa-cog').length).to.equal(1);
    expect(wrapper.find('.fa-power-off').length).to.equal(0);
    expect(wrapper.find('.fa-chevron-left').length).to.equal(0);
    expect(wrapper.find('.tag-success').text()).to.equal(`${notifications.size}`);

    Sidebar.prototype.componentDidMount.restore();

  });

  it('should load notifications after 60000ms', function () {

    const props = {
      isFetching: false,
      notifications: notifications,
      fetchNotifications: sinon.spy(),
      token: 'IMLOGGEDIN',
      location: {
        pathname: '/home'
      }
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;

    this.clock.tick(60000);
    expect(props.fetchNotifications).to.have.been.calledOnce;

  });

  it('should render itself & its children (logged out)', function () {

    const props = {
      isFetching: false,
      notifications: [],
      token: null,
      location: {
        pathname: '/home'
      }
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

  it('should render itself & its children (logged in/settings page)', function () {

    const props = {
      isFetching: false,
      notifications: notifications,
      token: 'IMLOGGEDIN',
      location: {
        pathname: '/settings'
      }
    };

    sinon.spy(Sidebar.prototype, 'componentDidMount');

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(Sidebar.prototype.componentDidMount).to.have.been.calledOnce;
    expect(wrapper.find('.fa-refresh').length).to.equal(1);
    expect(wrapper.find('.fa-refresh').first().hasClass('fa-spin')).to.be.false;
    expect(wrapper.find('.fa-cog').length).to.equal(1);
    expect(wrapper.find('.fa-power-off').length).to.equal(0);
    expect(wrapper.find('.tag-success').text()).to.equal(`${notifications.size}`);

    Sidebar.prototype.componentDidMount.restore();

  });

  it('should open the gitify repo in browser', function () {

    const props = {
      isFetching: false,
      notifications: [],
      token: null,
      location: {
        pathname: ''
      }
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;

    wrapper.find('.logo').simulate('click');

    expect(shell.openExternal).to.have.been.calledOnce;
    expect(shell.openExternal).to.have.been.calledWith('http://www.github.com/manosim/gitify');

  });

  it('should go back to home from settings', function () {

    const props = {
      isFetching: false,
      notifications: notifications,
      token: 'IMLOGGEDIN',
      location: {
        pathname: '/settings'
      }
    };

    const { wrapper, context } = setup(props);

    expect(wrapper).to.exist;
    expect(wrapper.find('.fa-cog').length).to.equal(1);

    wrapper.find('.fa-cog').simulate('click');
    expect(context.router.push).to.have.been.calledOnce;
    expect(context.router.push).to.have.been.calledWith('/notifications');

    context.router.push.reset();

  });

  it('should go to settings from home', function () {

    const props = {
      toggleSearch: sinon.spy(),
      isFetching: false,
      notifications: notifications,
      token: 'IMLOGGEDIN',
      showSearch: true,
      location: {
        pathname: '/home'
      }
    };

    const { wrapper, context } = setup(props);

    expect(wrapper).to.exist;
    expect(wrapper.find('.fa-cog').length).to.equal(1);

    wrapper.find('.fa-cog').simulate('click');

    expect(context.router.push).to.have.been.calledOnce;
    expect(context.router.push).to.have.been.calledWith('/settings');

    context.router.push.reset();

  });


  it('should refresh the notifications', function () {

    const props = {
      fetchNotifications: sinon.spy(),
      isFetching: false,
      notifications: notifications,
      token: 'IMLOGGEDIN',
      location: {
        pathname: '/home'
      }
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(wrapper.find('.fa-refresh').length).to.equal(1);

    wrapper.find('.fa-refresh').simulate('click');
    expect(props.fetchNotifications).to.have.been.calledOnce;

  });

});
