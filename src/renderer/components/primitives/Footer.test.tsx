import { render } from '@testing-library/react';

import { Footer } from './Footer';

describe('renderer/components/primitives/Footer.tsx', () => {
  it('should render itself & its children - space-between', () => {
    const tree = render(<Footer justify="space-between">Test</Footer>);

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - end', () => {
    const tree = render(<Footer justify="end">Test</Footer>);

    expect(tree).toMatchSnapshot();
  });
});
