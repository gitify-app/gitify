import { render } from '@testing-library/react';
import { ensureStableEmojis, mockDirectoryPath } from '../__mocks__/utils';
import { AllRead } from './AllRead';

describe('renderer/components/AllRead.tsx', () => {
  beforeEach(() => {
    ensureStableEmojis();
    mockDirectoryPath();
  });

  it('should render itself & its children', () => {
    const tree = render(<AllRead />);

    expect(tree).toMatchSnapshot();
  });
});
