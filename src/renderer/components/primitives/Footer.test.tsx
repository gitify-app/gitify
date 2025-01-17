import { render } from '@testing-library/react';
import { Footer } from './Footer';

describe('renderer/components/primitives/Footer.tsx', () => {
  it('should render itself & its children - justify-between', () => {
    const tree = render(<Footer justify="justify-between">Test</Footer>);

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - justify-end', () => {
    const tree = render(<Footer justify="justify-end">Test</Footer>);

    expect(tree).toMatchSnapshot();
  });
});
