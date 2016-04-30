import React from 'react'; // eslint-disable-line no-unused-vars
import TestUtils from 'react-addons-test-utils';
import { expect } from 'chai';

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

    mockSettings = {
      participating: false,
      playSound: true,
      showNotifications: true,
      markOnClick: false,
      openAtStartup: false
    };

    SettingsPage = require('../../components/settings').SettingsPage;
  });

  it('should render itself & its children', function () {
    const instance = TestUtils.renderIntoDocument(
      <SettingsPage
        updateSetting={() => true}
        settings={mockSettings} />
    );

    const node = TestUtils.findRenderedDOMComponentWithClass(instance, 'settings');
    expect(node).to.exist;
  });

});
