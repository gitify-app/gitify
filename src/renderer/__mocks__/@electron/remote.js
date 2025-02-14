let instance;

class BrowserWindow {
  constructor() {
    if (!instance) {
      instance = this;
    }
    // biome-ignore lint/correctness/noConstructorReturn: This is a mock class
    return instance;
  }
  loadURL = vi.fn();
  webContents = {
    on: () => {},
    session: {
      clearStorageData: vi.fn(),
    },
  };
  on() {}
  close = vi.fn();
  hide = vi.fn();
  destroy = vi.fn();
}

const dialog = {
  showErrorBox: vi.fn(),
};

module.exports = {
  BrowserWindow: BrowserWindow,
  dialog: dialog,
  app: {
    getLoginItemSettings: vi.fn(),
    setLoginItemSettings: () => {},
  },
  getCurrentWindow: vi.fn(() => instance || new BrowserWindow()),
};
