import { renderWithAppContext } from '../../__helpers__/test-utils';
import { SubjectTypeFilter } from './SubjectTypeFilter';

describe('renderer/components/filters/SubjectTypeFilter.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithAppContext(<SubjectTypeFilter />);

    expect(tree).toMatchSnapshot();
  });
});
