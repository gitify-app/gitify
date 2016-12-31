window.Notification = function (title, options) {
  this.title = title;

  return {
    onclick: jest.fn()
  };
};
