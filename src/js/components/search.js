var remote = window.require('remote');
var shell = remote.require('shell');

var React = require('react');
var Reflux = require('reflux');
var Actions = require('../actions/actions');
var SearchStore = require('../stores/search');

var Search = React.createClass({
  mixins: [
    Reflux.connect(SearchStore, 'searchTerm')
  ],

  onChange: function (event) {
    Actions.updateSearchTerm(event.target.value);
  },

  clearSearch: function () {
    Actions.clearSearchTerm();
  },

  openRepoBrowser: function () {
    shell.openExternal('http://www.github.com/ekonstantinidis/gitify');
  },

  render: function () {
    var clearSearchIcon;

    if (this.state.searchTerm) {
      clearSearchIcon = (
        <span className='octicon octicon-x' onClick={this.clearSearch} />
      );
    }

    return (
      <div className={this.props.showSearch ? 'container-fluid search-bar' : 'container-fluid' }>
        {this.props.showSearch ? (
            <div className='row'>
              <div className="col-xs-12">

                <div className='search-wrapper'>
                  {clearSearchIcon}
                  <input
                    autoFocus
                    value={this.state.searchTerm}
                    onChange={this.onChange}
                    className='search'
                    type='text'
                    placeholder='Search...' />
                </div>

              </div>
          </div>) : null }
      </div>
    );
  }
});

module.exports = Search;
