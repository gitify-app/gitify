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

let instance;

class BrowserWindow {
  constructor() {
    if (!instance) {
      instance = this;
    }
    return instance;
  }
  loadURL = jest.fn();
  webContents = {
    on: () => {},
    session: {
      clearStorageData: jest.fn(),
    },
  };
  on() {}
  close = jest.fn();
  hide = jest.fn();
  destroy = jest.fn();
}

const dialog = {
  showErrorBox: jest.fn(),
};

module.exports = {
  remote: {
    BrowserWindow: BrowserWindow,
    dialog: dialog,
    process: {
      platform: 'darwin',
    },
    app: {
      getVersion: () => '0.0.1',
      getLoginItemSettings: jest.fn(),
      setLoginItemSettings: () => {},
    },
    getCurrentWindow: jest.fn(() => instance || new BrowserWindow()),
  },
  ipcRenderer: {
    send: jest.fn(),
    on: jest.fn(),
  },
  shell: {
    openExternal: jest.fn(),
  },
};
