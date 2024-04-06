import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';

import { RateLimited } from './RateLimited';

describe('components/error/RateLimited.tsx', function () {
  it('should render itself & its children', function () {
    const tree = TestRenderer.create(<RateLimited />);

    expect(tree).toMatchSnapshot();
  });
});
