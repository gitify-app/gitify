/* global jest, describe, beforeEach, it, expect, spyOn */

jest.dontMock('reflux');
jest.dontMock('../../actions/actions.js');
jest.dontMock('../../utils/api-requests');
jest.dontMock('../../components/notification.js');
jest.dontMock('../../stores/auth.js');
jest.dontMock('../../stores/notifications.js');

var React = require('react/addons');
var TestUtils = React.addons.TestUtils;

describe('Test for Notifications Component', function () {

  var Actions, AuthStore, Notification, NotificationsStore;

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
    Notification = require('../../components/notifications.js');
    NotificationsStore = require('../../stores/notifications.js');
  });

  it('Should render the notifications component', function () {

    AuthStore.authStatus = function () {
      return true;
    };

    var instance = TestUtils.renderIntoDocument(<Notification />);
    expect(instance.state.loading).toBeTruthy();

    var response = [[{
      'repository': {
        'full_name': 'ekonstantinidis/gitify',
        'owner': {
          'avatar_url': 'http://avatar.url'
        }
      },
      'subject': {
        'type': 'Issue'
      }
    }]];

    NotificationsStore.trigger(response);
    expect(instance.state.notifications.length).toBe(1);

    expect(instance.state.loading).toBeTruthy();
    instance.completedNotifications();
    expect(instance.state.loading).toBeFalsy();

  });

});
