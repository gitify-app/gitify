var Reflux = require('reflux');

var Actions = Reflux.createActions({

  'login': {},
  'logout': {},
  'getNotifications': {asyncResult: true},
  'removeNotification': {},
  'isNewNotification': {},
  'updateSearchTerm': {},
  'clearSearchTerm': {},
  'setSetting': {}

});

module.exports = Actions;
