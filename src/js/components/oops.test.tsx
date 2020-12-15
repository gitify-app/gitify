import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';

import { Constants } from '../../utils/constants';

import { Oops } from './oops';

describe('components/oops.tsx', function () {
  it('should render itself & its children', function () {
    spyOn(Constants, 'ERROR_EMOJIS');

    const tree = TestRenderer.create(<Oops />);

    expect(tree).toMatchSnapshot();
  });
});
