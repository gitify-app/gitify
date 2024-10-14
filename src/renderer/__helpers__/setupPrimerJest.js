if (typeof CSS === 'undefined') {
  global.CSS = {};
}

if (!CSS.supports) {
  CSS.supports = () => true;
}

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
