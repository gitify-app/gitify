import { renderWithAppContext } from '../../__helpers__/test-utils';
import { HoverGroup } from './HoverGroup';

describe('renderer/components/primitives/HoverGroup.tsx', () => {
  it('should render', () => {
    const tree = renderWithAppContext(
      <HoverGroup bgColor="group-hover:bg-gitify-repository">
        Hover Group
      </HoverGroup>,
    );
    expect(tree).toMatchSnapshot();
  });
});
