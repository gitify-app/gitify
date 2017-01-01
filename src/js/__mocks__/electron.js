window.Notification = function (title, options) {
  this.title = title;

  return {
    onclick: jest.fn()
  };
};

window.localStorage = {
  store: {},
  getItem: function (key) { return this.store[key]; },
  setItem: function (key, item) {
    this.store[key] = item;
  },
  removeItem: jest.fn()
};

window.alert = jest.fn();

const browserWindow = {
  loadURL: jest.fn(),
  webContents: {
    on: () => {},
  },
  on: () => {},
  close: jest.fn(),
  destroy: jest.fn()
};

module.exports = {
  remote: {
    BrowserWindow: () => browserWindow
  },
  ipcRenderer: {
    send: jest.fn()
  },
  shell: {
    openExternal: jest.fn()
  },
};
