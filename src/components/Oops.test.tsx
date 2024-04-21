import * as TestRenderer from 'react-test-renderer';

import { Oops } from './Oops';

describe('components/Oops.tsx', () => {
  it('should render itself & its children', () => {
    const mockError = {
      title: 'Error title',
      descriptions: ['Error description'],
      emojis: ['🔥'],
    };
    const tree = TestRenderer.create(<Oops error={mockError} />);

    expect(tree).toMatchSnapshot();
  });
});
