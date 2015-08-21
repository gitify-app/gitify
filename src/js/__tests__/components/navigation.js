/* global jest, describe, beforeEach, it, expect, spyOn */

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
    // Mock localStorage
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
        },
        sendChannel: function () {
          return;
        }
      };
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
    expect(instance.goBack).toBeDefined();
    expect(instance.goToSettings).toBeDefined();
    expect(instance.appQuit).toBeDefined();

    var logoutIcon = TestUtils.scryRenderedDOMComponentsWithClass(instance, 'fa-sign-out');
    expect(logoutIcon.length).toBe(0);

    var quitIcon = TestUtils.scryRenderedDOMComponentsWithClass(instance, 'fa-power-off');
    expect(quitIcon.length).toBe(1);
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
    expect(instance.goBack).toBeDefined();
    expect(instance.goToSettings).toBeDefined();
    expect(instance.appQuit).toBeDefined();

    var logoutIcon = TestUtils.scryRenderedDOMComponentsWithClass(instance, 'fa-sign-out');
    expect(logoutIcon.length).toBe(1);

    // Now Logout
    instance.logOut();
    AuthStore.trigger();
    logoutIcon = TestUtils.scryRenderedDOMComponentsWithClass(instance, 'fa-sign-out');
    expect(logoutIcon.length).toBe(0);

    // Refresh Completed
    instance.state.loading = true;
    instance.refreshDone();
    expect(instance.state.loading).toBeFalsy();

    // Quit Application
    instance.appQuit();

  });

  it('Should test the refreshNotifications method', function () {

    spyOn(Actions, 'getNotifications');

    AuthStore.authStatus = function () {
      return true;
    };

    var instance = TestUtils.renderIntoDocument(<Navigation />);
    instance.refreshNotifications();
    expect(Actions.getNotifications).toHaveBeenCalled();

  });

  it('Should test the interval on componentDidMount', function () {

    spyOn(Actions, 'getNotifications');

    AuthStore.authStatus = function () {
      return true;
    };

    var instance = TestUtils.renderIntoDocument(<Navigation />);
    expect(instance.componentDidMount).toBeDefined();

    // Should refresh on interval
    jest.runOnlyPendingTimers();
    expect(Actions.getNotifications).toHaveBeenCalled();

  });

  it('Should test the transitions', function () {

    spyOn(Actions, 'getNotifications');

    AuthStore.authStatus = function () {
      return true;
    };

    var instance;
    React.withContext({router: new Router()}, function () {
      instance = TestUtils.renderIntoDocument(<Navigation toggleSearch={function () {
        // Should toggle the search bar
      }} />);
    });

    expect(instance.componentDidMount).toBeDefined();
    expect(instance.openBrowser).toBeDefined();

    instance.goBack();
    instance.goToSettings();
    instance.openBrowser();
    instance.showSearch();
  });

});
