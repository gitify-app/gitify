import * as TestRenderer from 'react-test-renderer';

import { mockMathRandom } from './test-utils';

import { AllRead } from './AllRead';

describe('components/AllRead.tsx', () => {
  // The read emoji randomly rotates, but then the snapshots would never match
  // Have to make it consistent so the emojis are always the same
  mockMathRandom(0.1);

  it('should render itself & its children', () => {
    const tree = TestRenderer.create(<AllRead />);

    expect(tree).toMatchSnapshot();
  });
});
