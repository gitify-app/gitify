var Reflux = require('reflux');
var Actions = require('../actions/actions');

var SearchStore = Reflux.createStore({
  listenables: Actions,

  onUpdateSearchTerm: function (searchTerm) {
    this._searchTerm = searchTerm;
    this.trigger(this.searchTerm());
  },

  onClearSearchTerm: function () {
    this._searchTerm = undefined;
    this.trigger(this.searchTerm());
  },

  searchTerm: function () {
    return this._searchTerm;
  }
});

module.exports = SearchStore;
