jest.unmock('../../components/all-read');

import React from 'react'; // eslint-disable-line no-unused-vars
import TestUtils from 'react-addons-test-utils';

describe('Test for Settings Component', function () {

  const AllRead = require('../../components/all-read').default;

  beforeEach(function () {
    // Pass
  });

  it('Should render the <AllRead /> component', function () {

    const instance = TestUtils.renderIntoDocument(<AllRead />);
    const heading = TestUtils.findRenderedDOMComponentWithTag(instance, 'h4');

    expect(heading).toBeDefined();
    expect(heading.textContent).toEqual('No new notifications.');

  });

});
