import React from 'react'; // eslint-disable-line no-unused-vars
import { shallow } from 'enzyme';
import Oops from '../../components/oops';

function setup() {
  const props = {};
  const wrapper = shallow(<Oops {...props} />);

  return {
    props: props,
    wrapper: wrapper,
  };
};

describe('components/oops.js', function () {

  it('should render itself & its children', function () {

    const { wrapper } = setup();

    expect(wrapper).to.exist;
    expect(wrapper.find('h2').text()).to.equal('Oops something went wrong.');

  });

});
