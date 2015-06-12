/* global jest, describe, beforeEach, it, expect, spyOn */

jest.dontMock('reflux');
jest.dontMock('../../actions/actions.js');
jest.dontMock('../../components/settings.js');
jest.dontMock('../../stores/settings.js');

var React = require('react/addons');
var TestUtils = React.addons.TestUtils;

describe('Test for Settings Component', function () {

  var Actions, SettingsStore, Settings;

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

    Actions = require('../../actions/actions.js');
    SettingsStore = require('../../stores/settings.js');
    Settings = require('../../components/settings.js');
  });

  it('Should render the settings component', function () {

    spyOn(Actions, 'setSetting');

    var instance = TestUtils.renderIntoDocument(<Settings />);

    expect(instance.state.participating).toBeFalsy();
    expect(instance.toggleParticipating).toBeDefined();
    expect(instance.appQuit).toBeDefined();

    instance.toggleParticipating({
      target: {
        checked: true
      }
    });
    expect(Actions.setSetting).toHaveBeenCalledWith('participating', true);

    instance.appQuit();
  });

});
