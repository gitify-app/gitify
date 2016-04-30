import React from 'react'; // eslint-disable-line no-unused-vars
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import { expect } from 'chai';

describe('all-read.js', function () {

  var AllRead;

  beforeEach(function () {
    AllRead = require('../../components/all-read').default;
  });


  it('should render itself & its children', function () {
    var instance = TestUtils.renderIntoDocument(<AllRead />);

    const node = ReactDOM.findDOMNode(instance);

    expect(node).to.exist;

    var heading = node.getElementsByTagName('h4');

    expect(heading.length).to.equal(1);
    expect(heading[0].textContent).to.equal('No new notifications.');
  });

});
