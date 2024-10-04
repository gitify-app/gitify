let instance;

class BrowserWindow {
  constructor() {
    if (!instance) {
      instance = this;
    }
    // biome-ignore lint/correctness/noConstructorReturn: This is a mock class
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
  app: {
    getLoginItemSettings: jest.fn(),
    setLoginItemSettings: () => {},
  },
  getCurrentWindow: jest.fn(() => instance || new BrowserWindow()),
};
