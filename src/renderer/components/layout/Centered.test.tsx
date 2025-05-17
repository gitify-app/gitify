import { render } from '@testing-library/react';

import { Centered } from './Centered';

describe('renderer/components/layout/Centered.tsx', () => {
  it('should render itself & its children - full height true', () => {
    const tree = render(<Centered fullHeight={true}>Test</Centered>);

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - full height false', () => {
    const tree = render(<Centered fullHeight={false}>Test</Centered>);

    expect(tree).toMatchSnapshot();
  });
});
