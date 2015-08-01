var Reflux = require('reflux');

var Actions = Reflux.createActions({

  'login': {},
  'logout': {},
  'getNotifications': {asyncResult: true},
  'removeNotification': {},
  'removeRepoNotifications': {},
  'isNewNotification': {},
  'updateSearchTerm': {},
  'clearSearchTerm': {},
  'setSetting': {}

});

module.exports = Actions;
