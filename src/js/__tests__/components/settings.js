import React from 'react'; // eslint-disable-line no-unused-vars
import { expect } from 'chai';
import { mount } from 'enzyme';
import sinon from 'sinon';
import Toggle from 'react-toggle';
import { SettingsPage } from '../../components/settings';

function setup() {
  const props = {
    updateSetting: () => true,
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

});

// function setup() {
//   const props = {
//     updateSetting: sinon.spy(),
//   };
// };
//
// describe('settings.js', function () {
//
//   it('should render itself & its children', function () {
//
//     sinon.spy(SettingsPage.prototype, 'componentDidMount');
//
//     const { props } = setup();
//     // const [ Toggle ] = output.props.children;
//
//     const wrapper = mount(<SettingsPage {...props} />);
//
//     // expect(SettingsPage.prototype.componentDidMount.calledOnce).to.be.true;
//     //
//     // console.log('YES YESY ESY');
//     // console.log(node);
//     // expect(output.props.className).toBe('container-fluid main-container settings');
//
//     // expect(node).toExist();
//   });
//
// });
