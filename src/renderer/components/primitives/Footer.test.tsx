import { renderWithAppContext } from '../../__helpers__/test-utils';

import { Footer } from './Footer';

describe('renderer/components/primitives/Footer.tsx', () => {
  it('should render itself & its children - space-between', () => {
    const tree = renderWithAppContext(
      <Footer justify="space-between">Test</Footer>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - end', () => {
    const tree = renderWithAppContext(<Footer justify="end">Test</Footer>);

    expect(tree).toMatchSnapshot();
  });
});
