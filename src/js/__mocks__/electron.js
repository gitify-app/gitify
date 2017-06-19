window.Notification = function(title) {
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
  getItem: function(key) {
    return this.store[key];
  },
  setItem: function(key, item) {
    this.store[key] = item;
  },
  removeItem: jest.fn(),
};

window.alert = jest.fn();

const browserWindow = {
  loadURL: jest.fn(),
  webContents: {
    on: () => {},
  },
  on: () => {},
  close: jest.fn(),
  hide: jest.fn(),
  destroy: jest.fn(),
};

const dialog = {
  showErrorBox: jest.fn(),
};

module.exports = {
  remote: {
    BrowserWindow: () => browserWindow,
    dialog: dialog,
    app: {
      getVersion: () => '0.0.1',
    },
    getCurrentWindow: jest.fn(() => browserWindow),
  },
  ipcRenderer: {
    send: jest.fn(),
    on: jest.fn(),
  },
  shell: {
    openExternal: jest.fn(),
  },
};
