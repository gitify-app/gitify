import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { Constants } from '../utils/constants';

import { AllRead } from './AllRead';

describe('components/all-read.tsx', function () {
  it('should render itself & its children', function () {
    spyOn(Constants, 'ALLREAD_EMOJIS');

    const tree = TestRenderer.create(<AllRead />);

    expect(tree).toMatchSnapshot();
  });
});
