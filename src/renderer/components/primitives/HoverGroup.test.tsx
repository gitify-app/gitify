import { render } from '@testing-library/react';

import { HoverGroup } from './HoverGroup';

describe('renderer/components/primitives/HoverGroup.tsx', () => {
  it('should render', () => {
    const tree = render(
      <HoverGroup bgColor="group-hover:bg-gitify-repository">
        Hover Group
      </HoverGroup>,
    );
    expect(tree).toMatchSnapshot();
  });
});
