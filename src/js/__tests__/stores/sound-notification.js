/*global jest, describe, it, expect, spyOn, beforeEach */

'use strict';

jest.dontMock('reflux');
jest.dontMock('../../stores/sound-notification.js');
jest.dontMock('../../utils/api-requests.js');
jest.dontMock('../../actions/actions.js');

describe('Tests for SoundNotificationStore', function () {

  var SoundNotificationStore, Actions;

  beforeEach(function () {

    // Mocks for Electron
    window.require = function () {
      return {
        ipcRenderer: {
          send: function () {
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

    // Mock Audio
    window.Audio = function () {
      return {
        play: function () {}
      };
    };

    // Mock Notifications
    window.Notification = function () {
      return {
        onClick: function () {}
      };
    };

    Actions = require('../../actions/actions.js');
    SoundNotificationStore = require('../../stores/sound-notification.js');
  });

  it('should get a payload and check if it should play sound & show notification.', function () {

    spyOn(SoundNotificationStore, 'showNotification');

    var payload = [{
      'id': '1',
      'repository': {
        'id': 1296269,
        'full_name': 'octocat/Hello-World',
        'description': 'This your first repo!'
      },
      'subject': {
        'title': 'Greetings',
        'url': 'https://api.github.com/repos/octokit/octokit.rb/issues/123'
      }
    }];

    SoundNotificationStore.onIsNewNotification(payload);

    expect(SoundNotificationStore.showNotification).toHaveBeenCalled();

  });

  it('Should reopen gitify when a notification is clicked', function () {
    var nativeNotification = SoundNotificationStore.newNotification('Test', 'Hello, world!');

    expect(nativeNotification.onclick.toString().indexOf('reopen-window') >= 0).toBe(true);

    nativeNotification.onclick();
  });

});
