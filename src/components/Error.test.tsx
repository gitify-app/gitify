import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';

import { Error } from './Error';

describe('components/Error.tsx', function () {
  it('should render itself & its children', function () {
    const mockError = {
      title: 'Error title',
      description: 'Error description',
      emojis: ['🔥'],
    };
    const tree = TestRenderer.create(<Error error={mockError} />);

    expect(tree).toMatchSnapshot();
  });
});
