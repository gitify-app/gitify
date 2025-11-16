import { renderWithAppContext } from '../../__helpers__/test-utils';
import { ReasonFilter } from './ReasonFilter';

describe('renderer/components/filters/ReasonFilter.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithAppContext(<ReasonFilter />);

    expect(tree).toMatchSnapshot();
  });
});
