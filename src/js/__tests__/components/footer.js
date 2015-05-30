/* global jest, describe, beforeEach, it, expect */

jest.dontMock('reflux');
jest.dontMock('../../actions/actions.js');
jest.dontMock('../../components/footer.js');

var React = require('react/addons');
var TestUtils = React.addons.TestUtils;

describe('Test for Footer', function () {

  var Actions, Footer;

  beforeEach(function () {
    // Mock Electron's window.require
    window.require = function () {
      return {
        require: function () {
          return {
            openExternal: function () {
              return {};
            },
          };
        },
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
