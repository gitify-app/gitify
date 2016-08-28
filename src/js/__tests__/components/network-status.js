import React from 'react'; // eslint-disable-line no-unused-vars
import { expect } from 'chai';
import { shallow } from 'enzyme';
import NetworkStatus from '../../components/network-status';

function setup() {
  const props = {};
  const wrapper = shallow(<NetworkStatus {...props} />);

  return {
    props: props,
    wrapper: wrapper,
  };
};

describe('components/network-status.js', function () {

  it('should render itself & its children', function () {

    const { wrapper } = setup();

    expect(wrapper).to.exist;
    expect(wrapper.find('.alert').text()).to.equal('Couldn\'t establish an internet connection.');

  });

});
