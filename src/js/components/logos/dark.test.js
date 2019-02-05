import React from 'react'; // eslint-disable-line no-unused-vars
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

import LogoDark from './dark';

describe('components/logos/dark.js', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<LogoDark />);

    expect(tree).toMatchSnapshot();
  });

  it('should click on the logo', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<LogoDark onClick={onClick} />);

    expect(wrapper).toBeDefined();

    wrapper.find('svg').simulate('click');

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
