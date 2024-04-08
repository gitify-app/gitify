import { fireEvent, render } from '@testing-library/react';

import * as TestRenderer from 'react-test-renderer';

import { Logo } from './Logo';

describe('components/Logo.tsx', () => {
  it('renders correctly (light)', () => {
    const tree = TestRenderer.create(<Logo />);

    expect(tree).toMatchSnapshot();
  });

  it('renders correctly(dark)', () => {
    const tree = TestRenderer.create(<Logo isDark />);

    expect(tree).toMatchSnapshot();
  });

  it('should click on the logo', () => {
    const onClick = jest.fn();
    const { getByRole } = render(<Logo onClick={onClick} />);

    fireEvent.click(getByRole('logo'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
