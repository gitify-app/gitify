/* global jest, describe, beforeEach, it, expect, spyOn */

jest.dontMock('reflux');
jest.dontMock('../../actions/actions.js');
jest.dontMock('../../components/search-input.js');
jest.dontMock('../../stores/auth.js');

var React = require('react/addons');
var TestUtils = React.addons.TestUtils;

describe('Test for Search Input Component', function () {

  var Actions, AuthStore, SearchInput;

  beforeEach(function () {
    // Mock Electron's window.require
    // and remote.require('shell')
    window.require = function () {
      return {
        require: function () {
          return {
            openExternal: function () {
              return {};
            }
          };
        }
      };
    };

    // Mock localStorage
    window.localStorage = {
      item: false,
      getItem: function () {
        return this.item;
      }
    };

    Actions = require('../../actions/actions.js');
    AuthStore = require('../../stores/auth.js');
    SearchInput = require('../../components/search-input.js');
  });

  it('Should make a search', function () {

    spyOn(Actions, 'updateSearchTerm');
    spyOn(Actions, 'clearSearchTerm');

    var instance = TestUtils.renderIntoDocument(<SearchInput />);

    var wrapper = TestUtils.scryRenderedDOMComponentsWithClass(instance, 'search-wrapper');
    expect(wrapper.length).toBe(1);

    instance.clearSearch();

    instance.onChange({
      target: {
        value: 'hello'
      }
    });

    expect(Actions.updateSearchTerm).toHaveBeenCalledWith('hello');
  });

  it('Should clear the search', function () {
    spyOn(Actions, 'clearSearchTerm');

    var instance = TestUtils.renderIntoDocument(<SearchInput />);
    expect(Actions.clearSearchTerm).not.toHaveBeenCalled();

    instance.clearSearch();
    expect(Actions.clearSearchTerm).toHaveBeenCalled();
  });

  it('Should only render clear button if search term is not empty', function () {
    var instance = TestUtils.renderIntoDocument(<SearchInput />);

    var clearButton = TestUtils.scryRenderedDOMComponentsWithClass(instance, 'octicon-x');
    expect(clearButton.length).toBe(0);

    instance.state.searchTerm = 'hello';
    instance.forceUpdate();

    clearButton = TestUtils.scryRenderedDOMComponentsWithClass(instance, 'octicon-x');
    expect(clearButton.length).toBe(1);
  });

});
