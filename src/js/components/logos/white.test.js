import React from 'react'; // eslint-disable-line no-unused-vars
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

import LogoWhite from './white';

describe('components/logos/white.js', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<LogoWhite />);

    expect(tree).toMatchSnapshot();
  });

  it('should click on the logo', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<LogoWhite onClick={onClick} />);

    expect(wrapper).toBeDefined();

    wrapper.find('svg').simulate('click');

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
