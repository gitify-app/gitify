var Reflux = require('reflux');

var Actions = Reflux.createActions({

  'login': {},
  'getNotifications': {asyncResult: true},

});

module.exports = Actions;
