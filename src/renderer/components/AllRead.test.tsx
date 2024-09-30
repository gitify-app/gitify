import { render } from '@testing-library/react';
import { ensureStableEmojis } from '../__mocks__/utils';
import { AllRead } from './AllRead';

describe('renderer/components/AllRead.tsx', () => {
  beforeEach(() => {
    ensureStableEmojis();
  });

  it('should render itself & its children', () => {
    const tree = render(<AllRead />);

    expect(tree).toMatchSnapshot();
  });
});
