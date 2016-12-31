import React from 'react'; // eslint-disable-line no-unused-vars
import { Map } from 'immutable';
import { shallow } from 'enzyme';
import { Checkbox, RadioGroup, Radio } from 'react-icheck';

const { ipcRenderer } = require('electron');

import { SettingsModal } from '../../components/settings-modal';

const options = {
  context: {
    location: {
      pathname: ''
    },
    router: {
      push: jest.fn(),
      replace: jest.fn()
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
    ipcRenderer.send.mockReset();
  });

  it('should render itself & its children', function () {

    const props = {
      isOpen: true,
      updateSetting: jest.fn(),
      fetchNotifications: jest.fn(),
      logout: jest.fn(),
      settings: Map({
        participating: false,
        playSound: true,
        showNotifications: true,
        markOnClick: false,
        openAtStartup: false
      })
    };

    const { wrapper } = setup(props);
    expect(wrapper).toBeDefined();
    expect(wrapper.find(Checkbox).length).toBe(5);
    expect(wrapper.find(RadioGroup).length).toBe(1);
    expect(wrapper.find(Radio).length).toBe(3);
    expect(wrapper.find('.octicon-sign-out').length).toBe(1);

  });

  it('should update a setting', function () {

    const props = {
      isOpen: true,
      updateSetting: jest.fn(),
      fetchNotifications: jest.fn(),
      logout: jest.fn(),
      settings: Map({
        participating: false,
        playSound: true,
        showNotifications: true,
        markOnClick: false,
        openAtStartup: false
      })
    };

    const { wrapper } = setup(props);
    expect(wrapper).toBeDefined();

    // Note: First Check is "participating"
    wrapper.find(Checkbox).first().props().onChange({target: {checked: true}});
    expect(props.updateSetting).toHaveBeenCalledTimes(1);

    wrapper.setProps({
      ...props,
      settings: Map({
        ...props.settings,
        participating: true
      })
    });
    expect(props.fetchNotifications).toHaveBeenCalledTimes(1);

  });

  it('should press the logout', function () {

    const props = {
      isOpen: true,
      updateSetting: jest.fn(),
      fetchNotifications: jest.fn(),
      logout: jest.fn(),
      settings: Map({
        participating: false,
        playSound: true,
        showNotifications: true,
        markOnClick: false,
        openAtStartup: false,
        showSettingsModal: false,
        hasStarred: false,
        showAppIcon: 'both',
      }),
      toggleSettingsModal: jest.fn()
    };

    const { wrapper, context } = setup(props);

    expect(wrapper).toBeDefined();

    wrapper.find('.octicon-sign-out').parent().simulate('click');

    expect(props.logout).toHaveBeenCalledTimes(1);

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('update-icon');

    expect(context.router.replace).toHaveBeenCalledTimes(1);
    expect(context.router.replace).toHaveBeenCalledWith('/login');

    expect(props.toggleSettingsModal).toHaveBeenCalledTimes(1);
  });

});
