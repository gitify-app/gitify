var Reflux = require('reflux');

var Actions = Reflux.createActions({

  'login': {},
  'logout': {},
  'getNotifications': {asyncResult: true},
  'updateSearchTerm': {},
  'clearSearchTerm': {},
  'setSetting': {}

});

module.exports = Actions;
