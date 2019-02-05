import React from 'react'; // eslint-disable-line no-unused-vars
import { List, Map } from 'immutable';
import { shallow } from 'enzyme';
import renderer from 'react-test-renderer';

const { ipcRenderer } = require('electron');

import { SettingsModal, mapStateToProps } from './settings-modal';

describe('components/settings-modal.js', () => {
  const props = {
    updateSetting: jest.fn(),
    fetchNotifications: jest.fn(),
    toggleSettingsModal: jest.fn(),
    logout: jest.fn(),
    isEitherLoggedIn: true,
    settings: Map({
      participating: false,
      playSound: true,
      showNotifications: true,
      markOnClick: false,
      openAtStartup: false,
      showSettingsModal: true,
      hasStarred: false,
      showAppIcon: 'both',
    }),
  };

  beforeEach(function() {
    ipcRenderer.send.mockReset();
    props.updateSetting.mockReset();
    props.toggleSettingsModal.mockReset();
  });

  it('should test the mapStateToProps method', () => {
    const state = {
      auth: Map({
        token: 123456,
        enterpriseAccounts: List(),
      }),
      settings: Map({
        participating: false,
        showSettingsModal: true,
      }),
    };

    const mappedProps = mapStateToProps(state);

    expect(mappedProps.isEitherLoggedIn).toBeTruthy();
    expect(mappedProps.settings.get('participating')).toBeFalsy();
    expect(mappedProps.settings.get('showSettingsModal')).toBeTruthy();
  });

  it('should close the modal on press of the escape key ', () => {
    spyOn(document, 'addEventListener').and.callFake((name, clb) => {
      if (name === 'keydown') {
        clb({ keyCode: 27 });
      }
    });

    spyOn(document, 'removeEventListener').and.callFake((name, clb) => {
      if (name === 'keydown') {
        clb({ keyCode: 27 });
      }
    });

    const wrapper = shallow(<SettingsModal {...props} />);
    expect(wrapper).toBeDefined();

    wrapper.instance().componentDidMount();
    expect(props.toggleSettingsModal).toHaveBeenCalledTimes(1);

    wrapper.instance().componentWillUnmount();
    expect(document.removeEventListener).toHaveBeenCalledTimes(1);
  });

  it('should render itself & its children (open modal)', () => {
    const tree = renderer.create(<SettingsModal {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children (closed modal)', () => {
    const caseProps = {
      ...props,
      settings: props.settings.set('showSettingsModal', false),
    };

    const tree = renderer.create(<SettingsModal {...caseProps} />);
    expect(tree).toMatchSnapshot();
  });

  it('should redirect if logged out', () => {
    const caseProps = {
      ...props,
      isEitherLoggedIn: false,
    };

    const wrapper = shallow(<SettingsModal {...caseProps} />);
    expect(wrapper).toBeDefined();
    expect(wrapper.props().to).toEqual('/login');
  });

  it('should press the logout', () => {
    const wrapper = shallow(<SettingsModal {...props} />);
    expect(wrapper).toBeDefined();

    wrapper.find('.btn-logout').simulate('click');

    expect(props.logout).toHaveBeenCalledTimes(1);

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('update-icon');

    expect(props.toggleSettingsModal).toHaveBeenCalledTimes(1);
  });

  it('should call the componentWillReceiveProps method', function() {
    const wrapper = shallow(<SettingsModal {...props} />);
    expect(wrapper).toBeDefined();

    wrapper.setProps({
      ...props,
      settings: props.settings.set(
        'participating',
        !props.settings.get('participating')
      ),
    });
    expect(props.fetchNotifications).toHaveBeenCalledTimes(1);
  });

  it('should close the modal pressing the icon', () => {
    const wrapper = shallow(<SettingsModal {...props} />);
    expect(wrapper).toBeDefined();
    wrapper.find('.close').simulate('click');
    expect(props.toggleSettingsModal).toHaveBeenCalledTimes(1);
  });

  it('should toggle the showOnlyParticipating checbox', () => {
    const wrapper = shallow(<SettingsModal {...props} />);
    expect(wrapper).toBeDefined();

    wrapper
      .find('.setting-participating')
      .simulate('change', { target: { checked: true } });

    expect(props.updateSetting).toHaveBeenCalledTimes(1);
  });

  it('should toggle the playSound checbox', () => {
    const wrapper = shallow(<SettingsModal {...props} />);
    expect(wrapper).toBeDefined();

    wrapper
      .find('.setting-play-sound')
      .simulate('change', { target: { checked: true } });

    expect(props.updateSetting).toHaveBeenCalledTimes(1);
  });

  it('should toggle the showNotifications checbox', () => {
    const wrapper = shallow(<SettingsModal {...props} />);
    expect(wrapper).toBeDefined();

    wrapper
      .find('.setting-notifications')
      .simulate('change', { target: { checked: true } });

    expect(props.updateSetting).toHaveBeenCalledTimes(1);
  });

  it('should toggle the onClickMarkAsRead checbox', () => {
    const wrapper = shallow(<SettingsModal {...props} />);
    expect(wrapper).toBeDefined();

    wrapper
      .find('.setting-mark-as-read')
      .simulate('change', { target: { checked: true } });

    expect(props.updateSetting).toHaveBeenCalledTimes(1);
  });

  it('should toggle the openAtStartup checbox', () => {
    const wrapper = shallow(<SettingsModal {...props} />);
    expect(wrapper).toBeDefined();

    wrapper
      .find('.setting-open-at-startup')
      .simulate('change', { target: { checked: true } });

    expect(props.updateSetting).toHaveBeenCalledTimes(1);
  });

  it('should toggle the showAppIcon radiogroup', () => {
    const wrapper = shallow(<SettingsModal {...props} />);
    expect(wrapper).toBeDefined();

    wrapper
      .find('RadioGroup')
      .simulate('change', { target: { value: 'both' } });

    expect(props.updateSetting).toHaveBeenCalledTimes(1);
    expect(props.updateSetting).toHaveBeenCalledWith('showAppIcon', 'both');
  });
});
