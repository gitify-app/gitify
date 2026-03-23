import { renderWithProviders } from '../../__helpers__/test-utils';

import { Contents } from './Contents';

describe('renderer/components/layout/Contents.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithProviders(<Contents>Test</Contents>);

    expect(tree.container).toMatchSnapshot();
  });
});
