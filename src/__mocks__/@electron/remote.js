let browserWindowInstance;

class BrowserWindow {
  constructor() {
    if (!browserWindowInstance) {
      browserWindowInstance = this;
    }
    return browserWindowInstance;
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
  getCurrentWindow: jest.fn(() => browserWindowInstance || new BrowserWindow()),
};
