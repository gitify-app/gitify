import React from 'react'; // eslint-disable-line no-unused-vars
import { expect } from 'chai';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import Toggle from 'react-toggle';
import { SettingsPage } from '../../components/settings';

function setup() {
  const props = {
    updateSetting: sinon.spy(),
    fetchNotifications: sinon.spy(),
    settings: {
      participating: false,
      playSound: true,
      showNotifications: true,
      markOnClick: false,
      openAtStartup: false
    }
  };

  const wrapper = shallow(<SettingsPage {...props} />);

  return {
    props: props,
    wrapper: wrapper,
  };
};

describe('components/settings.js', function () {

  it('should render itself & its children', function () {

    const { wrapper } = setup();

    expect(wrapper).to.exist;
    expect(wrapper.find(Toggle).length).to.equal(5);
    expect(wrapper.find('.footer').find('.text-right').text()).to.contain('Gitify - Version');

  });

  it('should update a setting', function () {

    const { wrapper, props } = setup();
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

  it('should check for updates and quit the app', function () {

    const { wrapper } = setup();

    expect(wrapper).to.exist;

    wrapper.find('.btn-primary').simulate('click');
    wrapper.find('.btn-danger').simulate('click');

  });

});
