import { renderWithProviders } from '../../__helpers__/test-utils';

import { CustomCounter } from './CustomCounter';

describe('renderer/components/primitives/CustomCounter.tsx', () => {
  it('renders itself & its children', () => {
    const tree = renderWithProviders(<CustomCounter value={100} />);

    expect(tree.container).toMatchSnapshot();
  });
});
