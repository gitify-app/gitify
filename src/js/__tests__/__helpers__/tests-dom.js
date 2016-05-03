import jsdom from 'jsdom';
import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';

chai.expect();
chai.use(sinonChai);

global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = document.defaultView;
global.navigator = {userAgent: 'node.js'};
global.localStorage = {
  store: {},
  getItem: function (key) { return this.store[key]; },
  setItem: function (key, item) {
    this.store[key] = item;
  }
};

// Audio
global.Audio = function (filename) {
  this.filename = filename;

  return {
    play: sinon.spy()
  };
};

// Notification
global.Notification = function (title, options) {
  this.title = title;

  return {
    onclick: sinon.spy()
  };
};

// Mocks for Electron
const requireElectron = {
  ipcRenderer: {
    send: sinon.spy()
  },
  shell: {
    openExternal: sinon.spy()
  },
  remote: {
    BrowserWindow: function () {
      return {
        loadURL: sinon.spy(),
        webContents: {
          on: () => {},
        },
        on: sinon.spy(),
        close: sinon.spy(),
        destroy: sinon.spy()
      };
    }
  },
};

window.require = function () {
  return requireElectron;
};
