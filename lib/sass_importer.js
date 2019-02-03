let path = require('path');

module.exports = function(file) {
  if (file.startsWith('~')) {
    file = `../node_modules/${file.replace(/^~/, '')}`
  }
  return { file };
};
