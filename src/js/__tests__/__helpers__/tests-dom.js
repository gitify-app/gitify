import jsdom from 'jsdom';
import sinon from 'sinon';

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
    play: function () {
      return sinon.spy();
    }
  };
};

// Notification
global.Notification = function (title, options) {
  this.title = title;

  return {
    onclick: function () {
      return sinon.spy();
    }
  };
};

// Mocks for Electron
window.require = function () {
  return {
    ipcRenderer: {
      send: (type) => sinon.spy()
    },
    shell: {
      openExternal: (url) => sinon.spy()
    }
  };
};
