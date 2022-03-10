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
  },
  shell: {
    openExternal: jest.fn(),
  },
};
