import { act, render } from '@testing-library/react';

import { ensureStableEmojis } from '../__mocks__/utils';
import { Oops } from './Oops';

describe('renderer/components/Oops.tsx', () => {
  beforeEach(() => {
    ensureStableEmojis();
  });

  it('should render itself & its children - specified error', async () => {
    const mockError = {
      title: 'Error title',
      descriptions: ['Error description'],
      emojis: ['🔥'],
    };

    let tree: ReturnType<typeof render> | null = null;

    await act(async () => {
      tree = render(<Oops error={mockError} />);
    });

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - fallback to unknown error', async () => {
    let tree: ReturnType<typeof render> | null = null;

    await act(async () => {
      tree = render(<Oops error={null} />);
    });

    expect(tree).toMatchSnapshot();
  });
});
