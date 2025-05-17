import { render } from '@testing-library/react';

import { CustomCounter } from './CustomCounter';

describe('renderer/components/primitives/CustomCounter.tsx', () => {
  it('should render itself & its children', () => {
    const tree = render(<CustomCounter value={100} />);

    expect(tree).toMatchSnapshot();
  });
});
