/* global jest, describe, beforeEach, it, expect, spyOn */

jest.dontMock('reflux');
jest.dontMock('../../actions/actions.js');
jest.dontMock('../../utils/api-requests');
jest.dontMock('../../components/navigation.js');
jest.dontMock('../../stores/auth.js');

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import createHistory from 'history/lib/createMemoryHistory';

describe('Test for Navigation', function () {

  var apiRequests, Actions, Navigation, AuthStore, history;

  var Stub = React.createClass({
    childContextTypes: {
      location: React.PropTypes.object.isRequired
    },

    getChildContext: function () {
      return {
        location: {
          pathname: "/settings",
          anotherOne: function (argument) {

          }
        }
      };
    },

    render: function () {
      return this.props.children;
    }
  });


  beforeEach(function () {

    // Mocks for Electron
    window.require = function () {
      return {
        shell: {
          openExternal: function () {
            // Open External link in Browser
          }
        },
        ipcRenderer: {
          send: function () {
            // Fake sending message to ipcMain
          }
        },
      };
    };

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

    apiRequests = require('../../utils/api-requests.js');
    Actions = require('../../actions/actions.js');
    AuthStore = require('../../stores/auth.js');
    Navigation = require('../../components/navigation.js');

    history = createHistory();
  });

  it('Should load the navigation component for logged out users', function () {

    AuthStore.authStatus = function () {
      return false;
    };

    var parent = TestUtils.renderIntoDocument(<Stub><Navigation /></Stub>);
    var instance = TestUtils.findRenderedComponentWithType(parent, Navigation);

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

    var parent = TestUtils.renderIntoDocument(<Stub><Navigation /></Stub>);
    var instance = TestUtils.findRenderedComponentWithType(parent, Navigation);
    instance.history = history;

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

    var parent = TestUtils.renderIntoDocument(<Stub><Navigation /></Stub>);
    var instance = TestUtils.findRenderedComponentWithType(parent, Navigation);
    instance.refreshNotifications();
    expect(Actions.getNotifications).toHaveBeenCalled();

  });

  it('Should test the interval on componentDidMount', function () {

    spyOn(Actions, 'getNotifications');

    AuthStore.authStatus = function () {
      return true;
    };

    var parent = TestUtils.renderIntoDocument(<Stub><Navigation /></Stub>);
    var instance = TestUtils.findRenderedComponentWithType(parent, Navigation);
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

    var parent = TestUtils.renderIntoDocument(<Stub><Navigation toggleSearch={() => {}} /></Stub>);
    var instance = TestUtils.findRenderedComponentWithType(parent, Navigation);
    instance.history = history;

    expect(instance.componentDidMount).toBeDefined();
    expect(instance.openBrowser).toBeDefined();

    instance.goBack();
    instance.goToSettings();
    instance.openBrowser();
    instance.showSearch();
  });

  it('Should show the search icon & count label only if notifications', function () {

    spyOn(Actions, 'getNotifications');

    AuthStore.authStatus = function () {
      return true;
    };

    var parent = TestUtils.renderIntoDocument(<Stub><Navigation /></Stub>);
    var instance = TestUtils.findRenderedComponentWithType(parent, Navigation);

    instance.state.notifications = [{
      title: 'test'
    }, {
      title: 'another test'
    }];

    instance.forceUpdate();

    var searchIcon = TestUtils.findRenderedDOMComponentWithClass(instance, 'fa-search');
    expect(searchIcon).toBeDefined();

    var countLabel = TestUtils.findRenderedDOMComponentWithClass(instance, 'label-success');
    expect(countLabel).toBeDefined();

  });
});
