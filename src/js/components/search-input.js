var React = require('react');

var SearchInput = React.createClass({
  onChange: function (event) {
    this.setState({
      searchTerm: event.target.value
    });
  },

  clearSearch: function () {
    this.setState({
      searchTerm: undefined
    });
  },

  getInitialState: function() {
    return {};
  },

  render: function () {
    return (
      <div className='search-wrapper'>
        <span className='octicon octicon-x' onClick={this.clearSearch} />
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
