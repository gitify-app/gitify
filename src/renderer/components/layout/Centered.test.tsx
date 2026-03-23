import { renderWithProviders } from '../../__helpers__/test-utils';

import { Centered } from './Centered';

describe('renderer/components/layout/Centered.tsx', () => {
  it('should render itself & its children - full height true', () => {
    const tree = renderWithProviders(
      <Centered fullHeight={true}>Test</Centered>,
    );

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children - full height false', () => {
    const tree = renderWithProviders(
      <Centered fullHeight={false}>Test</Centered>,
    );

    expect(tree.container).toMatchSnapshot();
  });
});
