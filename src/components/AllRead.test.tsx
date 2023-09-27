import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';

import { mockMathRandom } from './test-utils';

import { AllRead } from './AllRead';

describe('components/all-read.tsx', function () {
  // The read emoji randomly rotates, but then the snapshots would never match
  // Have to make it consistent so the emojis are always the same
  mockMathRandom(0.1);

  it('should render itself & its children', function () {
    const tree = TestRenderer.create(<AllRead />);

    expect(tree).toMatchSnapshot();
  });
});
