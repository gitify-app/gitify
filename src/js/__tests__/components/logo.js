import React from 'react'; // eslint-disable-line no-unused-vars
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

import Logo from '../../components/logo';

describe('components/logo.js', () => {
  it('renders correctly - white logo', () => {
    const tree = renderer.create(
      <Logo />
    );

    expect(tree).toMatchSnapshot();
  });

  it('renders correctly - dark logo', () => {
    const tree = renderer.create(
      <Logo isDark />
    );

    expect(tree).toMatchSnapshot();
  });

  it('should click on the logo', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<Logo onClick={onClick} />);

    expect(wrapper).toBeDefined();

    wrapper.find('svg').simulate('click');

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
