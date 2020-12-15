import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { Constants } from '../../utils/Constants';

import { AllRead } from './all-read';

jest.mock('react-typist');

describe('components/all-read.tsx', function () {
  it('should render itself & its children', function () {
    spyOn(Constants, 'ALLREAD_EMOJIS');
    spyOn(Constants, 'ALLREAD_MESSAGES');

    const tree = TestRenderer.create(<AllRead />);

    expect(tree).toMatchSnapshot();
  });
});
