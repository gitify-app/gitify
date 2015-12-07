/* global jest, describe, beforeEach, it, expect, spyOn */

jest.dontMock('reflux');
jest.dontMock('../../actions/actions.js');
jest.dontMock('../../components/settings.js');
jest.dontMock('../../stores/settings.js');

var React = require('react');
var TestUtils = require('react-addons-test-utils');

describe('Test for Settings Component', function () {

  var Actions, SettingsStore, Settings;

  beforeEach(function () {

    // Mocks for Electron
    window.require = function () {
      return {
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
      getItem: function () {
        return this.item;
      },
      setItem: function (item) {
        this.item = item;
      }
    };

    Actions = require('../../actions/actions.js');
    SettingsStore = require('../../stores/settings.js');
    Settings = require('../../components/settings.js');
  });

  it('Should render the settings component', function () {

    spyOn(Actions, 'setSetting');

    var instance = TestUtils.renderIntoDocument(<Settings />);

    expect(instance.state.participating).toBeFalsy();
    expect(instance.toggleSetting).toBeDefined();
    expect(instance.appQuit).toBeDefined();
    expect(instance.checkForUpdates).toBeDefined();

    instance.toggleSetting('participating', {
      target: {
        checked: true
      }
    });
    expect(Actions.setSetting).toHaveBeenCalledWith('participating', true);

    instance.appQuit();
    instance.checkForUpdates();
  });

});
