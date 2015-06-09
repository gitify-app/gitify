var Reflux = require('reflux');

var Actions = Reflux.createActions({

  'login': {},
  'logout': {},
  'getNotifications': {asyncResult: true},
  'getSettings': {},
  'setSetting': {}

});

module.exports = Actions;
