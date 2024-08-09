import { render } from '@testing-library/react';
import { mockDirectoryPath } from '../__mocks__/utils';
import { Oops } from './Oops';

describe('components/Oops.tsx', () => {
  beforeEach(() => {
    mockDirectoryPath();
  });

  it('should render itself & its children', () => {
    const mockError = {
      title: 'Error title',
      descriptions: ['Error description'],
      emojis: ['🔥'],
    };
    const tree = render(<Oops error={mockError} />);

    expect(tree).toMatchSnapshot();
  });
});
