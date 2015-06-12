var React = require('react');
var Reflux = require('reflux');
var SearchStore = require('../stores/search');
var Actions = require('../actions/actions');

var SearchInput = React.createClass({
  mixins: [
    Reflux.connect(SearchStore, 'searchTerm')
  ],

  onChange: function (event) {
    Actions.updateSearchTerm(event.target.value);
  },

  clearSearch: function () {
    Actions.clearSearchTerm();
  },

  getInitialState: function () {
    return {};
  },

  render: function () {
    var clearSearchIcon;

    if (this.state.searchTerm) {
      clearSearchIcon = (
        <span className='octicon octicon-x' onClick={this.clearSearch} />
      );
    }

    return (
      <div className='search-wrapper'>
        {clearSearchIcon}
        <input
          value={this.state.searchTerm}
          onChange={this.onChange}
          className='search'
          type='text'
          placeholder='Search...' />
      </div>
    );
  }
});

module.exports = SearchInput;
