import { renderWithProviders } from '../../__helpers__/test-utils';

import { StackedPrsPill } from './StackedPrsPill';

describe('renderer/components/metrics/StackedPrsPill.tsx', () => {
  it('renders nothing when not stacked', () => {
    const tree = renderWithProviders(<StackedPrsPill />);
    expect(tree.container).toBeEmptyDOMElement();
  });

  it('renders a pill when stacked', () => {
    const tree = renderWithProviders(<StackedPrsPill isStacked stackDepth={2} />);
    expect(tree.getByText('2')).toBeInTheDocument();
  });
});
