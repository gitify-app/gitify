import React from 'react'; // eslint-disable-line no-unused-vars
import { Map } from 'immutable';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import { Checkbox, RadioGroup, Radio } from 'react-icheck';

import { SettingsModal } from '../../components/settings-modal';
const ipcRenderer = window.require('electron').ipcRenderer;

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

function setup(props) {
  const wrapper = shallow(<SettingsModal {...props} />, options);

  return {
    context: options.context,
    props: props,
    wrapper: wrapper,
  };
};

describe('components/settings-modal.js', function () {

  beforeEach(function() {
    ipcRenderer.send.reset();
  });

  it('should render itself & its children', function () {

    const props = {
      isOpen: true,
      updateSetting: sinon.spy(),
      fetchNotifications: sinon.spy(),
      logout: sinon.spy(),
      settings: Map({
        participating: false,
        playSound: true,
        showNotifications: true,
        markOnClick: false,
        openAtStartup: false
      })
    };

    const { wrapper } = setup(props);
    expect(wrapper).to.exist;
    expect(wrapper.find(Checkbox).length).to.equal(5);
    expect(wrapper.find(RadioGroup).length).to.equal(1);
    expect(wrapper.find(Radio).length).to.equal(3);
    expect(wrapper.find('.octicon-sign-out').length).to.equal(1);

  });

  it('should update a setting', function () {

    const props = {
      isOpen: true,
      updateSetting: sinon.spy(),
      fetchNotifications: sinon.spy(),
      logout: sinon.spy(),
      settings: Map({
        participating: false,
        playSound: true,
        showNotifications: true,
        markOnClick: false,
        openAtStartup: false
      })
    };

    const { wrapper } = setup(props);
    expect(wrapper).to.exist;

    // Note: First Check is "participating"
    wrapper.find(Checkbox).first().props().onChange({target: {checked: true}});
    expect(props.updateSetting).to.have.been.calledOnce;

    wrapper.setProps({
      ...props,
      settings: Map({
        ...props.settings,
        participating: true
      })
    });
    expect(props.fetchNotifications).to.have.been.calledOnce;

  });

  it('should press the logout', function () {

    const props = {
      isOpen: true,
      updateSetting: sinon.spy(),
      fetchNotifications: sinon.spy(),
      logout: sinon.spy(),
      settings: Map({
        participating: false,
        playSound: true,
        showNotifications: true,
        markOnClick: false,
        openAtStartup: false
      })
    };

    const { wrapper, context } = setup(props);

    expect(wrapper).to.exist;

    wrapper.find('.octicon-sign-out').parent().simulate('click');

    expect(props.logout).to.have.been.calledOnce;

    expect(ipcRenderer.send).to.have.been.calledOnce;
    expect(ipcRenderer.send).to.have.been.calledWith('update-icon', 'IconPlain');

    expect(context.router.replace).to.have.been.calledOnce;
    expect(context.router.replace).to.have.been.calledWith('/login');

    context.router.replace.reset();

  });

});
