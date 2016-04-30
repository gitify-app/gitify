jest.unmock('../../components/settings');

import React from 'react'; // eslint-disable-line no-unused-vars
import TestUtils from 'react-addons-test-utils';

describe('settings.js', function () {

  var SettingsPage, mockSettings;

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

    SettingsPage = require('../../components/settings').SettingsPage;

    mockSettings = {
      participating: false,
      playSound: true,
      showNotifications: true,
      markOnClick: false,
      openAtStartup: false
    };
  });

  it('Should render the <Settings /> component', function () {

    const instance = TestUtils.renderIntoDocument(
      <SettingsPage
        updateSetting={() => true}
        settings={mockSettings} />
    );
    const node = TestUtils.findRenderedDOMComponentWithClass(instance, 'settings');

    expect(node).toBeDefined();

  });

});
