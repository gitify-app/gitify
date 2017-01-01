import React from 'react'; // eslint-disable-line no-unused-vars
import { shallow } from 'enzyme';
import { App } from '../../containers/app';

describe('containers/app.js', function () {
  it('should render itself & its children', function () {
    const props = {
      location: '/home'
    };
    const wrapper = shallow(<App {...props} />);

    expect(wrapper).toBeDefined();
  });
});
