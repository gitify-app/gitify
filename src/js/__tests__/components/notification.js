/* global jest, describe, beforeEach, it, expect */

jest.dontMock('reflux');
jest.dontMock('../../actions/actions.js');
jest.dontMock('../../utils/api-requests');
jest.dontMock('../../components/notification.js');
jest.dontMock('../../stores/auth.js');
jest.dontMock('../../stores/notifications.js');

var React = require('react/addons');
var TestUtils = React.addons.TestUtils;

describe('Test for Notification Component', function () {

  var apiRequests, Actions, AuthStore, SingleNotification, NotificationsStore;

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
      },
      setItem: function (item) {
        this.item = item;
      }
    };

    apiRequests = require('../../utils/api-requests.js');
    Actions = require('../../actions/actions.js');
    AuthStore = require('../../stores/auth.js');
    SingleNotification = require('../../components/notification.js');
    NotificationsStore = require('../../stores/notifications.js');
  });

  it('Should render a notification component (Issue)', function () {

    var notification = {
      'id': '123123123',
      'repository': {
        'full_name': 'ekonstantinidis/gitify',
        'owner': {
          'avatar_url': 'http://avatar.url'
        }
      },
      'subject': {
        'type': 'Issue',
        'url': 'http://www.github.com/ekonstantinidis/gitify/pulls/26/'
      }
    };

    var instance = TestUtils.renderIntoDocument(
      <SingleNotification
        notification={notification}
        key={notification.id} />);

    expect(instance.state.isRead).toBeFalsy();
    expect(instance.openBrowser).toBeDefined();
    expect(instance.markAsRead).toBeDefined();

    // Open Browser
    instance.openBrowser();

  });

  it('Should render a notification component (PullRequest)', function () {

    var notification = {
      'id': '123123123',
      'repository': {
        'full_name': 'ekonstantinidis/gitify',
        'owner': {
          'avatar_url': 'http://avatar.url'
        }
      },
      'subject': {
        'type': 'PullRequest',
        'url': 'http://www.github.com/ekonstantinidis/gitify/pulls/26/'
      }
    };

    var instance = TestUtils.renderIntoDocument(
      <SingleNotification
        notification={notification}
        key={notification.id} />);

    expect(instance.state.isRead).toBeFalsy();
    expect(instance.openBrowser).toBeDefined();
    expect(instance.markAsRead).toBeDefined();

  });

  it('Should render a notification component (OtherType)', function () {

    var notification = {
      'id': '123123123',
      'repository': {
        'full_name': 'ekonstantinidis/gitify',
        'owner': {
          'avatar_url': 'http://avatar.url'
        }
      },
      'subject': {
        'type': 'OtherType',
        'url': 'http://www.github.com/ekonstantinidis/gitify/pulls/26/'
      }
    };

    var instance = TestUtils.renderIntoDocument(
      <SingleNotification
        notification={notification}
        key={notification.id} />);

    expect(instance.state.isRead).toBeFalsy();
    expect(instance.openBrowser).toBeDefined();
    expect(instance.markAsRead).toBeDefined();

  });

  it('Should mark a notification as read succesfully', function () {

    var notification = {
      'id': '123123123',
      'repository': {
        'full_name': 'ekonstantinidis/gitify',
        'owner': {
          'avatar_url': 'http://avatar.url'
        }
      },
      'subject': {
        'type': 'Issue',
        'url': 'http://www.github.com/ekonstantinidis/gitify/pulls/26/'
      }
    };

    var instance = TestUtils.renderIntoDocument(
      <SingleNotification
        notification={notification}
        key={notification.id} />);

    var superagent = require('superagent');
    superagent.__setResponse(200, 'ok', {}, false);

    instance.markAsRead();

  });

  it('Should fail to mark a notification as read succesfully', function () {

    var notification = {
      'id': '123123123',
      'repository': {
        'full_name': 'ekonstantinidis/gitify',
        'owner': {
          'avatar_url': 'http://avatar.url'
        }
      },
      'subject': {
        'type': 'Commit',
        'url': 'http://www.github.com/ekonstantinidis/gitify/pulls/26/'
      }
    };

    var instance = TestUtils.renderIntoDocument(
      <SingleNotification
        notification={notification}
        key={notification.id} />);

    var superagent = require('superagent');
    superagent.__setResponse(400, 'notOk', {}, false);

    instance.markAsRead();

  });

});
