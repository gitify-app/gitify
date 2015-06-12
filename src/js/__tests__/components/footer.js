/* global jest, describe, beforeEach, it, expect */

jest.dontMock('reflux');
jest.dontMock('../../actions/actions.js');
jest.dontMock('../../components/footer.js');

var React = require('react/addons');
var TestUtils = React.addons.TestUtils;

describe('Test for Footer', function () {

  var Actions, Footer;

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

    Actions = require('../../actions/actions.js');
    Footer = require('../../components/footer.js');
  });

  it('Should load the footer', function () {

    var instance = TestUtils.renderIntoDocument(<Footer />);
    expect(instance.openRepoBrowser).toBeDefined();

    instance.openRepoBrowser();

  });

});
