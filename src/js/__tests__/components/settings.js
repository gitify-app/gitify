import React from 'react'; // eslint-disable-line no-unused-vars
import { expect } from 'chai';
import { mount } from 'enzyme';
import sinon from 'sinon';
import Toggle from 'react-toggle';
import { SettingsPage } from '../../components/settings';

function setup() {
  const props = {
    updateSetting: sinon.spy(),
    settings: {
      participating: false,
      playSound: true,
      showNotifications: true,
      markOnClick: false,
      openAtStartup: false
    }
  };

  const wrapper = mount(<SettingsPage {...props} />);

  return {
    props: props,
    wrapper: wrapper,
  };
};

describe('settings.js', function () {

  it('should render itself & its children', function () {

    const { wrapper } = setup();

    expect(wrapper).to.exist;
    expect(wrapper.props().settings.participating).to.be.false;
    expect(wrapper.find(Toggle).length).to.equal(5);
    expect(wrapper.find('.footer').find('.text-right').text()).to.contain('Gitify - Version');

  });

  it('should update a setting', function () {

    const { wrapper } = setup();

    expect(wrapper).to.exist;
    wrapper.find(Toggle).first().props().onChange({target: {checked: true}});
    expect(wrapper.props().updateSetting.calledOnce).to.be.true;

  });

  it('should check for updates and quit the app', function () {

    const { wrapper } = setup();

    expect(wrapper).to.exist;

    wrapper.find('.btn-primary').simulate('click');
    wrapper.find('.btn-danger').simulate('click');

  });

});
