/* global jest, describe, beforeEach, it, expect */

jest.dontMock('reflux');
jest.dontMock('../../actions/actions.js');
jest.dontMock('../../utils/api-requests');
jest.dontMock('../../components/navigation.js');
jest.dontMock('../../stores/auth.js');

var React = require('react/addons');
var TestUtils = React.addons.TestUtils;

describe('Test for Navigation', function () {

  var apiRequests, Actions, Navigation, AuthStore, Router;

  beforeEach(function () {
    // Mock Electron's window.require
    // and remote.require('shell')
    window.require = function () {
      return {
        sendChannel: function () {
          return;
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

    apiRequests = require('../../utils/api-requests.js');
    Actions = require('../../actions/actions.js');
    AuthStore = require('../../stores/auth.js');
    Navigation = require('../../components/navigation.js');
    Router = require('react-router');
  });

  it('Should load the navigation component for logged out users', function () {

    AuthStore.authStatus = function () {
      return false;
    };

    var instance = TestUtils.renderIntoDocument(<Navigation />);
    expect(instance.state.loading).toBeFalsy();
    expect(instance.refreshNotifications).toBeDefined();
    expect(instance.refreshDone).toBeDefined();
    expect(instance.logOut).toBeDefined();
    expect(instance.appQuit).toBeDefined();

    var logoutIcon = TestUtils.scryRenderedDOMComponentsWithClass(instance, 'fa-sign-out');
    expect(logoutIcon.length).toBe(0);

  });

  it('Should load the navigation component for logged in users', function () {

    AuthStore.authStatus = function () {
      return true;
    };

    var instance;
    React.withContext({router: new Router()}, function () {
      instance = TestUtils.renderIntoDocument(<Navigation />);
    });

    expect(instance.state.loading).toBeFalsy();
    expect(instance.refreshNotifications).toBeDefined();
    expect(instance.refreshDone).toBeDefined();
    expect(instance.logOut).toBeDefined();
    expect(instance.appQuit).toBeDefined();

    var logoutIcon = TestUtils.scryRenderedDOMComponentsWithClass(instance, 'fa-sign-out');
    expect(logoutIcon.length).toBe(1);

    // Now Logout
    instance.logOut();
    AuthStore.trigger();
    logoutIcon = TestUtils.scryRenderedDOMComponentsWithClass(instance, 'fa-sign-out');
    expect(logoutIcon.length).toBe(0);

  });

});
