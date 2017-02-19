import React from 'react'; // eslint-disable-line no-unused-vars
import { Map } from 'immutable';
import { shallow } from 'enzyme';
import { Checkbox, RadioGroup, Radio } from 'react-icheck';

const { ipcRenderer } = require('electron');

import { SettingsModal, mapStateToProps } from '../../components/settings-modal';

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

describe('components/settings-modal.js', () => {
  const props = {
    isOpen: true,
    updateSetting: jest.fn(),
    fetchNotifications: jest.fn(),
    logout: jest.fn(),
    toggleSettingsModal: jest.fn(),
    settings: Map({
      participating: false,
      playSound: true,
      showNotifications: true,
      markOnClick: false,
      openAtStartup: false,
      showSettingsModal: false,
      hasStarred: false,
      showAppIcon: 'both',
    })
  };

  beforeEach(function() {
    ipcRenderer.send.mockReset();
    props.updateSetting.mockReset();
    props.toggleSettingsModal.mockReset();
  });

  it('should test the mapStateToProps method', () => {
    const state = {
      settings: {
        hello: 'world'
      }
    };

    const mappedProps = mapStateToProps(state);

    expect(mappedProps.settings.hello).toEqual('world');
  });

  it('should close the modal on press of the escape key ', () => {
    spyOn(document, 'addEventListener').and.callFake((name, clb) => {
      if (name === 'keydown') {
        clb({keyCode: 27});
      }
    });

    spyOn(document, 'removeEventListener').and.callFake((name, clb) => {
      if (name === 'keydown') {
        clb({keyCode: 27});
      }
    });

    const { wrapper } = setup(props);
    expect(wrapper).toBeDefined();

    wrapper.instance().componentDidMount();
    expect(props.toggleSettingsModal).toHaveBeenCalledTimes(1);

    wrapper.instance().componentWillUnmount();
    expect(document.removeEventListener).toHaveBeenCalledTimes(1);
  });

  it('should render itself & its children', () => {
    const { wrapper } = setup(props);
    expect(wrapper).toBeDefined();
    expect(wrapper.find(Checkbox).length).toBe(5);
    expect(wrapper.find(RadioGroup).length).toBe(1);
    expect(wrapper.find(Radio).length).toBe(3);
    expect(wrapper.find('.octicon-sign-out').length).toBe(1);
  });

  it('should press the logout', () => {
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

  it('should call the componentWillReceiveProps method', function () {
    const { wrapper } = setup(props);
    expect(wrapper).toBeDefined();

    wrapper.setProps({
      ...props,
      settings: props.settings.set('participating', !props.settings.get('participating'))
    });
    expect(props.fetchNotifications).toHaveBeenCalledTimes(1);
  });

  it('should close the modal pressing the icon', () => {
    const { wrapper } = setup(props);
    expect(wrapper).toBeDefined();
    wrapper.find('.btn-close').simulate('click');
    expect(props.toggleSettingsModal).toHaveBeenCalledTimes(1);
  });

  it('should toggle the showOnlyParticipating checbox', () => {
    const { wrapper } = setup(props);
    expect(wrapper).toBeDefined();

    wrapper
      .findWhere(node => node.props().label === 'Show only participating')
      .simulate('change', {target: {checked: true}});

    expect(props.updateSetting).toHaveBeenCalledTimes(1);
  });

  it('should toggle the playSound checbox', () => {
    const { wrapper } = setup(props);
    expect(wrapper).toBeDefined();

    wrapper
      .findWhere(node => node.props().label === 'Play sound')
      .simulate('change', {target: {checked: true}});

    expect(props.updateSetting).toHaveBeenCalledTimes(1);
  });

  it('should toggle the showNotifications checbox', () => {
    const { wrapper } = setup(props);
    expect(wrapper).toBeDefined();

    wrapper
      .findWhere(node => node.props().label === 'Show notifications')
      .simulate('change', {target: {checked: true}});

    expect(props.updateSetting).toHaveBeenCalledTimes(1);
  });

  it('should toggle the onClickMarkAsRead checbox', () => {
    const { wrapper } = setup(props);
    expect(wrapper).toBeDefined();

    wrapper
      .findWhere(node => node.props().label === 'On Click, Mark as Read')
      .simulate('change', {target: {checked: true}});

    expect(props.updateSetting).toHaveBeenCalledTimes(1);
  });

  it('should toggle the openAtStartup checbox', () => {
    const { wrapper } = setup(props);
    expect(wrapper).toBeDefined();

    wrapper
      .findWhere(node => node.props().label === 'Open at startup')
      .simulate('change', {target: {checked: true}});

    expect(props.updateSetting).toHaveBeenCalledTimes(1);
  });

  it('should toggle the showAppIcon radiogroup', () => {
    const { wrapper } = setup(props);
    expect(wrapper).toBeDefined();

    wrapper.find('RadioGroup').simulate('change', {target: {value: 'both'}});

    expect(props.updateSetting).toHaveBeenCalledTimes(1);
    expect(props.updateSetting).toHaveBeenCalledWith('showAppIcon', 'both');
  });
});
