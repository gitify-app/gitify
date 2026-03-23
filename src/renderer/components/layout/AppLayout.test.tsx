import { renderWithProviders } from '../../__helpers__/test-utils';

import { AppLayout } from './AppLayout';

describe('renderer/components/layout/AppLayout.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithProviders(<AppLayout>Test</AppLayout>);

    expect(tree.container).toMatchSnapshot();
  });
});
