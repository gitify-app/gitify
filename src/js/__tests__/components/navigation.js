import React from 'react'; // eslint-disable-line no-unused-vars
import { expect } from 'chai';
import { mount } from 'enzyme';
import sinon from 'sinon';
import { Navigation } from '../../components/navigation';
const ipcRenderer = window.require('electron').ipcRenderer;
const shell = window.require('electron').shell;

function setup(props) {
  const options = {
    context: {
      location: {
        pathname: ''
      },
      router: {
        push: () => true,
        replace: () => true
      }
    }
  };

  const wrapper = mount(<Navigation {...props} />, options);

  return {
    props: props,
    wrapper: wrapper,
  };
};

describe('components/navigation.js', function () {

  const notifications = [{ id: 1 }, { id: 2 }];

  it('should render itself & its children (logged in)', function () {
    const props = {
      isFetching: false,
      notifications: notifications,
      token: 'IMLOGGEDIN',
      location: {
        pathname: '/home'
      }
    };

    sinon.spy(Navigation.prototype, 'componentDidMount');

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(Navigation.prototype.componentDidMount).to.have.been.calledOnce;
    expect(wrapper.find('.fa-refresh').length).to.equal(1);
    expect(wrapper.find('.fa-refresh').first().hasClass('fa-spin')).to.be.false;
    expect(wrapper.find('.fa-sign-out').length).to.equal(1);
    expect(wrapper.find('.fa-cog').length).to.equal(1);
    expect(wrapper.find('.fa-search').length).to.equal(1);
    expect(wrapper.find('.fa-power-off').length).to.equal(0);
    expect(wrapper.find('.fa-chevron-left').length).to.equal(0);
    expect(wrapper.find('.label-success').text()).to.equal(`${notifications.length}`);

    Navigation.prototype.componentDidMount.restore();

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

    sinon.spy(Navigation.prototype, 'componentDidMount');

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(Navigation.prototype.componentDidMount).to.have.been.calledOnce;
    expect(wrapper.find('.fa-refresh').length).to.equal(0);
    expect(wrapper.find('.fa-sign-out').length).to.equal(0);
    expect(wrapper.find('.fa-cog').length).to.equal(0);
    expect(wrapper.find('.fa-search').length).to.equal(0);
    expect(wrapper.find('.fa-power-off').length).to.equal(1);
    expect(wrapper.find('.fa-chevron-left').length).to.equal(0);
    expect(wrapper.find('.label-success').length).to.equal(0);

    Navigation.prototype.componentDidMount.restore();

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

    sinon.spy(Navigation.prototype, 'componentDidMount');

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(Navigation.prototype.componentDidMount).to.have.been.calledOnce;
    expect(wrapper.find('.fa-refresh').length).to.equal(1);
    expect(wrapper.find('.fa-refresh').first().hasClass('fa-spin')).to.be.false;
    expect(wrapper.find('.fa-sign-out').length).to.equal(1);
    expect(wrapper.find('.fa-cog').length).to.equal(1);
    expect(wrapper.find('.fa-search').length).to.equal(1);
    expect(wrapper.find('.fa-power-off').length).to.equal(0);
    expect(wrapper.find('.label-success').text()).to.equal(`${notifications.length}`);

    expect(wrapper.find('.fa-chevron-left').length).to.equal(1);

    Navigation.prototype.componentDidMount.restore();

  });

  it('should quit the app', function () {
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
    expect(wrapper.find('.fa-refresh').length).to.equal(0);
    expect(wrapper.find('.fa-sign-out').length).to.equal(0);
    expect(wrapper.find('.fa-power-off').length).to.equal(1);

    wrapper.find('.fa-power-off').simulate('click');
    expect(ipcRenderer.send).to.have.been.calledOnce;
    ipcRenderer.send().reset();

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
    expect(wrapper.find('.fa-refresh').length).to.equal(0);
    expect(wrapper.find('.fa-sign-out').length).to.equal(0);
    expect(wrapper.find('.fa-power-off').length).to.equal(1);

    wrapper.find('.logo').simulate('click');

    expect(shell.openExternal).to.have.been.calledOnce;
    shell.openExternal().reset();

  });

});
