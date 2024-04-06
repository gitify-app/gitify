import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';

import { BadCredentials } from './BadCredentials';

describe('components/error/BadCredentials.tsx', function () {
  it('should render itself & its children', function () {
    const tree = TestRenderer.create(<BadCredentials />);

    expect(tree).toMatchSnapshot();
  });
});
