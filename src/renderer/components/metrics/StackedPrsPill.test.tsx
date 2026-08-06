import { renderWithProviders } from '../../__helpers__/test-utils';

import { StackedPrsPill } from './StackedPrsPill';

describe('renderer/components/metrics/StackedPrsPill.tsx', () => {
  it('renders nothing when not stacked', () => {
    const tree = renderWithProviders(<StackedPrsPill />);
    expect(tree.container).toBeEmptyDOMElement();
  });

  it('renders a pill when stacked', () => {
    const tree = renderWithProviders(<StackedPrsPill isStacked stackPosition={1} stackDepth={2} />);
    expect(tree.getByText('1/2')).toBeInTheDocument();
  });

  it('renders a pill with no position/depth metric when position is missing', () => {
    const tree = renderWithProviders(<StackedPrsPill isStacked stackDepth={2} />);
    expect(tree.queryByText('2')).not.toBeInTheDocument();
  });
});
