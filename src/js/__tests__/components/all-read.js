import { expect } from 'chai';

describe('all-read.js', function () {

  const React = require('react'); // eslint-disable-line no-unused-vars
  const ReactDOM = require('react-dom');
  const TestUtils = require('react-addons-test-utils');
  const AllRead = require('../../components/all-read').default;

  it('should render itself & its children', function () {
    var instance = TestUtils.renderIntoDocument(<AllRead />);

    const node = ReactDOM.findDOMNode(instance);

    expect(node).to.exist;

    var paragraphs = node.getElementsByTagName('h4');

    expect(paragraphs.length).to.equal(1);
    expect(paragraphs[0].textContent).to.equal('No new notifications.');
  });

});
