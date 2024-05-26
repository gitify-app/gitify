import { render } from '@testing-library/react';
import { AllRead } from './AllRead';
import { mockMathRandom } from './test-utils';

describe('components/AllRead.tsx', () => {
  // The read emoji randomly rotates, but then the snapshots would never match
  // Have to make it consistent so the emojis are always the same
  mockMathRandom(0.1);

  it('should render itself & its children', () => {
    const tree = render(<AllRead />);

    expect(tree).toMatchSnapshot();
  });
});
