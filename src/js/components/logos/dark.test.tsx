import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { fireEvent, render } from '@testing-library/react';

import { LogoDark } from './dark';

describe('components/logos/dark.tsx', () => {
  it('renders correctly', () => {
    const tree = TestRenderer.create(<LogoDark />);

    expect(tree).toMatchSnapshot();
  });

  it('should click on the logo', () => {
    const onClick = jest.fn();
    const { getByRole } = render(<LogoDark onClick={onClick} />);

    fireEvent.click(getByRole('logo'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
