import { render } from '@testing-library/react';
import { ensureStableEmojis } from '../__mocks__/utils';
import { Oops } from './Oops';

describe('renderer/components/Oops.tsx', () => {
  beforeEach(() => {
    ensureStableEmojis();
  });

  it('should render itself & its children - specified error', () => {
    const mockError = {
      title: 'Error title',
      descriptions: ['Error description'],
      emojis: ['🔥'],
    };
    const tree = render(<Oops error={mockError} />);

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - fallback to unknown error', () => {
    const tree = render(<Oops error={null} />);

    expect(tree).toMatchSnapshot();
  });
});
