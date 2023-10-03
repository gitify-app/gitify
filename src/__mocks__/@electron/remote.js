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
};
