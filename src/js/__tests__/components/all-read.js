jest.unmock('../../components/all-read');

import React from 'react'; // eslint-disable-line no-unused-vars
// import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';

describe('Test for Settings Component', function () {

  const AllRead = require('../../components/all-read').default;

  // beforeEach(function () {
    // Actions = require('../../actions/actions.js');
    // SettingsStore = require('../../stores/settings.js');
    // Settings = require('../../components/settings.js');
  // });

  it('Should render the <AllRead /> component', function () {

    const instance = TestUtils.renderIntoDocument(<AllRead />);
    // const elementNode = ReactDOM.findDOMNode(instance);

    const heading = TestUtils.findRenderedDOMComponentWithTag(instance, 'h4');
    // console.log('--------');
    // console.log('--------');
    // // console.log(heading);
    // console.log('--------');
    // console.log('--------');

    expect(heading).toBeDefined();
    expect(heading.textContent).toEqual('No new notifications.');

  });

});
