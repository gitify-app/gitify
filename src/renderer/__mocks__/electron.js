const { namespacedEvent } = require('../../shared/events');

// @ts-ignore
window.Notification = function (title) {
  this.title = title;

  return {
    onclick: vi.fn(),
  };
};

// @ts-ignore
window.Audio = class Audio {
  constructor(path) {
    this.path = path;
  }

  play() {}
};

// @ts-ignore
window.localStorage = {
  store: {},
  getItem: function (key) {
    return this.store[key];
  },
  setItem: function (key, item) {
    this.store[key] = item;
  },
  removeItem: vi.fn(),
};

window.alert = vi.fn();

module.exports = {
  ipcRenderer: {
    send: vi.fn(),
    on: vi.fn(),
    sendSync: vi.fn(),
    invoke: vi.fn((channel, ..._args) => {
      switch (channel) {
        case 'get-platform':
          return Promise.resolve('darwin');
        case namespacedEvent('version'):
          return Promise.resolve('0.0.1');
        case namespacedEvent('safe-storage-encrypt'):
          return Promise.resolve('encrypted');
        case namespacedEvent('safe-storage-decrypt'):
          return Promise.resolve('decrypted');
        default:
          return Promise.reject(new Error(`Unknown channel: ${channel}`));
      }
    }),
  },
  shell: {
    openExternal: vi.fn(),
  },
  webFrame: {
    setZoomLevel: vi.fn(),
    getZoomLevel: vi.fn(),
  },
};
