/*global jest, describe, it, expect, spyOn, beforeEach */

'use strict';

jest.dontMock('reflux');
jest.dontMock('../../stores/settings.js');
jest.dontMock('../../actions/actions.js');

describe('Tests for SettingsStore', function () {

  var SettingsStore, Actions;

  beforeEach(function () {

    // Mock Electron's window.require
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
      },
      setItem: function (item) {
        this.item = item;
      }
    };

    Actions = require('../../actions/actions.js');
    SettingsStore = require('../../stores/settings.js');
  });

  it('should get the settings', function () {

    spyOn(SettingsStore, 'trigger');

    expect(SettingsStore.getSettings().participating).toBe(false);

  });

  it('should set a setting', function () {

    spyOn(SettingsStore, 'trigger');

    SettingsStore.onSetSetting('participating', true);

    expect(SettingsStore.getSettings().participating).toBe(true);

  });

});

describe('Tests for SettingsStore', function () {

  var SettingsStore, Actions;

  beforeEach(function () {

    // Mock Electron's window.require
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
        return '{}';
      },
      setItem: function (item) {
        this.item = item;
      }
    };

    Actions = require('../../actions/actions.js');
    SettingsStore = require('../../stores/settings.js');
  });

  it('should get the settings as string', function () {

    spyOn(SettingsStore, 'trigger');

    SettingsStore.getSettings();

  });

});
