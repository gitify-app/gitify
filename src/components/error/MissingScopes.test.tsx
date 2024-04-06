import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';

import { MissingScopes } from './MissingScopes';

describe('components/error/MissingScopes.tsx', function () {
  it('should render itself & its children', function () {
    const tree = TestRenderer.create(<MissingScopes />);

    expect(tree).toMatchSnapshot();
  });
});
