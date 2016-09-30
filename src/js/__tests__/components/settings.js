import React from 'react'; // eslint-disable-line no-unused-vars
import { shallow } from 'enzyme';
: jasmine.spy()import Toggle from 'react-toggle';
import { SettingsPage } from '../../components/settings';
const ipcRenderer = window.require('electron').ipcRenderer;

const options = {
  context: {
    location: {
      pathname: ''
    },
    router: {
      push: jasmine.spy(),
      replace: jasmine.spy()
    }
  }
};

function setup(props) {
  const wrapper = shallow(<SettingsPage {...props} />, options);

  return {
    context: options.context,
    props: props,
    wrapper: wrapper,
  };
};

describe('components/settings.js', function () {

  beforeEach(function() {
    ipcRenderer.send.reset();
  });

  it('should render itself & its children', function () {

    const props = {
      updateSetting: jasmine.spy(),
      fetchNotifications: jasmine.spy(),
      logout: jasmine.spy(),
      settings: {
        participating: false,
        playSound: true,
        showNotifications: true,
        markOnClick: false,
        openAtStartup: false
      }
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(wrapper.find(Toggle).length).to.equal(5);
    expect(wrapper.find('.fa-sign-out').length).to.equal(1);
    expect(wrapper.find('.footer').find('.text-right').text()).to.contain('Gitify - Version');

  });

  it('should update a setting', function () {

    const props = {
      updateSetting: jasmine.spy(),
      fetchNotifications: jasmine.spy(),
      logout: jasmine.spy(),
      settings: {
        participating: false,
        playSound: true,
        showNotifications: true,
        markOnClick: false,
        openAtStartup: false
      }
    };

    const { wrapper } = setup(props);
    expect(wrapper).to.exist;

    // Note: First Toggle is "participating"
    wrapper.find(Toggle).first().props().onChange({target: {checked: true}});
    expect(props.updateSetting).to.have.been.calledOnce;

    wrapper.setProps({
      ...props,
      settings: {
        ...props.settings,
        participating: true
      }
    });
    expect(props.fetchNotifications).to.have.been.calledOnce;

  });

  it('should check for updates ', function () {

    const props = {
      updateSetting: jasmine.spy(),
      fetchNotifications: jasmine.spy(),
      logout: jasmine.spy(),
      settings: {
        participating: false,
        playSound: true,
        showNotifications: true,
        markOnClick: false,
        openAtStartup: false
      }
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;

    wrapper.find('.fa-cloud-download').parent().simulate('click');
    expect(ipcRenderer.send).to.have.been.calledOnce;
    expect(ipcRenderer.send).to.have.been.calledWith('check-update');

  });

  it('should quit the app', function () {

    const props = {
      updateSetting: jasmine.spy(),
      fetchNotifications: jasmine.spy(),
      logout: jasmine.spy(),
      settings: {
        participating: false,
        playSound: true,
        showNotifications: true,
        markOnClick: false,
        openAtStartup: false
      }
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;

    wrapper.find('.fa-power-off').parent().simulate('click');
    expect(ipcRenderer.send).to.have.been.calledOnce;
    expect(ipcRenderer.send).to.have.been.calledWith('app-quit');

  });

  it('should press the logout', function () {

    const props = {
      updateSetting: jasmine.spy(),
      fetchNotifications: jasmine.spy(),
      logout: jasmine.spy(),
      settings: {
        participating: false,
        playSound: true,
        showNotifications: true,
        markOnClick: false,
        openAtStartup: false
      }
    };

    const { wrapper, context } = setup(props);

    expect(wrapper).to.exist;

    wrapper.find('.fa-sign-out').parent().simulate('click');

    expect(props.logout).to.have.been.calledOnce;

    expect(ipcRenderer.send).to.have.been.calledOnce;
    expect(ipcRenderer.send).to.have.been.calledWith('update-icon', 'IconPlain');

    expect(context.router.replace).to.have.been.calledOnce;
    expect(context.router.replace).to.have.been.calledWith('/login');

    context.router.replace.reset();

  });

});
