import jsdom from 'jsdom';

global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = document.defaultView;
global.navigator = {userAgent: 'node.js'};

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
