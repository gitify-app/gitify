import React from 'react'; // eslint-disable-line no-unused-vars
import { expect } from 'chai';
import { shallow } from 'enzyme';
import App from '../../containers/app';

function setup() {
  const props = {
    location: '/home'
  };
  const wrapper = shallow(<App {...props} />);

  return {
    props: props,
    wrapper: wrapper,
  };
};

describe('containers/app.js', function () {

  it('should render itself & its children', function () {

    const { wrapper } = setup();

    expect(wrapper).to.exist;
    expect(wrapper.state().showSearch).to.be.false;

    wrapper.instance().toggleSearch();
    expect(wrapper.state().showSearch).to.be.true;
  });

});
