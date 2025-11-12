import { render } from '@testing-library/react';

import { describe, expect, it } from 'vitest';

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
