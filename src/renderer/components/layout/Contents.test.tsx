import { renderWithProviders } from '../../__helpers__/test-utils';

import { Contents } from './Contents';

describe('renderer/components/layout/Contents.tsx', () => {
  it('renders itself & its children', () => {
    const tree = renderWithProviders(<Contents>Test</Contents>);

    expect(tree.container).toMatchSnapshot();
  });

  it('renders with scroll fade', () => {
    const tree = renderWithProviders(<Contents scrollFade>Test</Contents>);

    expect(tree.container).toMatchSnapshot();
  });
});
