var Reflux = require('reflux');

var Actions = Reflux.createActions({

  'login': {},
  'logout': {},
  'getNotifications': {asyncResult: true},

});

module.exports = Actions;
