import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';

import { RateLimit } from './RateLimit';

describe('components/error/RateLimit.tsx', function () {
  it('should render itself & its children', function () {
    const tree = TestRenderer.create(<RateLimit />);

    expect(tree).toMatchSnapshot();
  });
});
