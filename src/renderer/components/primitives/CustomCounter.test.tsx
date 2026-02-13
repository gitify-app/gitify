import { renderWithAppContext } from '../../__helpers__/test-utils';

import { CustomCounter } from './CustomCounter';

describe('renderer/components/primitives/CustomCounter.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithAppContext(<CustomCounter value={100} />);

    expect(tree.container).toMatchSnapshot();
  });
});
