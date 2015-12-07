/* global spyOn, jest, describe, beforeEach, it, expect */

jest.dontMock('reflux');
jest.dontMock('../../actions/actions.js');
jest.dontMock('../../components/search.js');
jest.dontMock('../../stores/auth.js');

var React = require('react');
var TestUtils = require('react-addons-test-utils');

describe('Test for Search Component', function () {

  var Actions, AuthStore, Search;

  beforeEach(function () {

    window.localStorage = {
      item: false,
      setItem: function (item) {
        this.item = item;
      },
      getItem: function () {
        return this.item;
      },
      clear: function () {
        this.item = false;
      }
    };

    Actions = require('../../actions/actions.js');
    AuthStore = require('../../stores/auth.js');
    Search = require('../../components/search.js');

  });

  it('Should make a search', function () {

    spyOn(Actions, 'updateSearchTerm');
    spyOn(Actions, 'clearSearchTerm');

    var instance = TestUtils.renderIntoDocument(<Search showSearch={true} />);

    var wrapper = TestUtils.scryRenderedDOMComponentsWithClass(instance, 'search-wrapper');
    expect(wrapper.length).toBe(1);

    instance.clearSearch();

    instance.updateSearchTerm({
      target: {
        value: 'hello'
      }
    });

    expect(Actions.updateSearchTerm).toHaveBeenCalledWith('hello');

    instance.componentWillReceiveProps({showSearch: false});
    expect(Actions.updateSearchTerm).toHaveBeenCalledWith('');
  });

  it('Should only render clear button if search term is not empty', function () {
    var instance = TestUtils.renderIntoDocument(<Search showSearch={true} />);

    var clearButton = TestUtils.scryRenderedDOMComponentsWithClass(instance, 'octicon-x');
    expect(clearButton.length).toBe(0);

    instance.state.searchTerm = 'hello';
    instance.forceUpdate();

    clearButton = TestUtils.scryRenderedDOMComponentsWithClass(instance, 'octicon-x');
    expect(clearButton.length).toBe(1);
  });

  it('Should hide the search bar', function () {
    var instance = TestUtils.renderIntoDocument(<Search showSearch={false} />);
    var searchBar = TestUtils.scryRenderedDOMComponentsWithClass(instance, 'search-bar');
    expect(searchBar.length).toBe(0);
  });
});
