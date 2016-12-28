import React from 'react'; // eslint-disable-line no-unused-vars
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { App } from '../../containers/app';

function setupShallow() {
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

    const { wrapper } = setupShallow();
    expect(wrapper).to.exist;

  });

});
