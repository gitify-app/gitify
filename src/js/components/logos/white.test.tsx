import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { fireEvent, render } from '@testing-library/react';

import { LogoWhite } from './white';

describe('components/logos/white.tsx', () => {
  it('renders correctly', () => {
    const tree = TestRenderer.create(<LogoWhite />);

    expect(tree).toMatchSnapshot();
  });

  it('should click on the logo', () => {
    const onClick = jest.fn();
    const { getByRole } = render(<LogoWhite onClick={onClick} />);

    fireEvent.click(getByRole('logo'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
