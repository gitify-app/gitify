import { renderWithAppContext } from '../../__helpers__/test-utils';
import { StateFilter } from './StateFilter';

describe('renderer/components/filters/StateFilter.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithAppContext(<StateFilter />);

    expect(tree).toMatchSnapshot();
  });
});
