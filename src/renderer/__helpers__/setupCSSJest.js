if (typeof CSS === 'undefined') {
  global.CSS = {};
}

if (!CSS.supports) {
  CSS.supports = () => true;
}
