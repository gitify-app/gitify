window.Notification = function (title) {
  this.title = title;

  return {
    onclick: jest.fn(),
  };
};

window.Audio = class Audio {
  constructor(path) {
    this.path = path;
  }

  play() {}
};

window.localStorage = {
  store: {},
  getItem: function (key) {
    return this.store[key];
  },
  setItem: function (key, item) {
    this.store[key] = item;
  },
  removeItem: jest.fn(),
};

window.alert = jest.fn();

module.exports = {
  ipcRenderer: {
    send: jest.fn(),
    on: jest.fn(),
    sendSync: jest.fn(),
    invoke: jest.fn((channel, ...args) => {
      switch (channel) {
        case 'get-platform':
          return Promise.resolve('darwin');
        case 'gitify:version':
          return Promise.resolve('0.0.1');
        default:
          return Promise.reject(new Error(`Unknown channel: ${channel}`));
      }
    }),
  },
  shell: {
    openExternal: jest.fn(),
  },
};
