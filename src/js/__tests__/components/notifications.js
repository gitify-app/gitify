/* global jest, describe, beforeEach, it, expect */

jest.dontMock('reflux');
jest.dontMock('../../actions/actions.js');
jest.dontMock('../../utils/api-requests');
jest.dontMock('../../components/notifications.js');
jest.dontMock('../../stores/auth.js');
jest.dontMock('../../stores/notifications.js');

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';

describe('Test for Notifications Component', function () {

  var Actions, AuthStore, Notifications, NotificationsStore;

  beforeEach(function () {

    // Mocks for Electron
    window.require = function () {
      return {
        shell: {
          openExternal: function () {
            // Fake sending message to ipcMain
          }
        },
      }
    };

    // Mock localStorage
    window.localStorage = {
      item: false,
      getItem: function () {
        return this.item;
      },
      setItem: function (item) {
        this.item = item;
      }
    };

    Actions = require('../../actions/actions.js');
    AuthStore = require('../../stores/auth.js');
    Notifications = require('../../components/notifications.js');
    NotificationsStore = require('../../stores/notifications.js');
  });

  it('Should render the notifications component', function () {

    AuthStore.authStatus = function () {
      return true;
    };

    var instance = TestUtils.renderIntoDocument(<Notifications />);
    expect(instance.state.loading).toBeTruthy();

    var response = [{
      'id': '123123123',
      'repository': {
        'full_name': 'ekonstantinidis/gitify',
        'owner': {
          'avatar_url': 'http://avatar.url'
        }
      },
      'subject': {
        'type': 'Issue'
      }
    }];

    NotificationsStore.trigger(response);
    expect(instance.state.notifications.length).toBe(1);

    expect(instance.state.loading).toBeTruthy();
    instance.completedNotifications();
    expect(instance.state.loading).toBeFalsy();
    expect(instance.state.errors).toBeFalsy();

    var errors = TestUtils.scryRenderedDOMComponentsWithClass(instance, 'errored');
    expect(errors.length).toBe(0);

    instance.failedNotifications();
    expect(instance.state.loading).toBeFalsy();
    expect(instance.state.errors).toBeTruthy();

    errors = TestUtils.scryRenderedDOMComponentsWithClass(instance, 'errored');
    expect(errors.length).toBe(1);

    expect(instance.areIn('ekonstantinidis/gitify', 'gitify')).toBeTruthy();
    expect(instance.areIn('ekonstantinidis/gitify', 'hello')).toBeFalsy();

    instance.state.searchTerm = 'hello';
    var matches = instance.matchesSearchTerm(response[0]);
    expect(matches).toBeFalsy();

    instance.state.searchTerm = 'gitify';
    matches = instance.matchesSearchTerm(response[0]);
    expect(matches).toBeTruthy();

    instance.state.notifications = ['One', 'Two'];
    instance.openBrowser();
  });

  it('Should only render repos that match the search term', function () {
    AuthStore.authStatus = function () {
      return true;
    };

    var instance = TestUtils.renderIntoDocument(<Notifications />);

    var response = [{
      'id': '123123123',
      'repository': {
        'full_name': 'ekonstantinidis/gitify',
        'owner': {
          'avatar_url': 'http://avatar.url'
        }
      },
      'subject': {
        'type': 'Issue'
      }
    },
    {
      'id': '2424242424242',
      'repository': {
        'full_name': 'ekonstantinidis/gitify',
        'owner': {
          'avatar_url': 'http://avatar.url'
        }
      },
      'subject': {
        'type': 'Release'
      }
    }];

    NotificationsStore.trigger(response);

    var notifications = TestUtils.scryRenderedDOMComponentsWithClass(instance, 'repository');
    expect(notifications.length).toBe(1);

    instance.state.searchTerm = 'hello';
    instance.forceUpdate();

    notifications = TestUtils.scryRenderedDOMComponentsWithClass(instance, 'repository');
    expect(notifications.length).toBe(0);
  });

});
