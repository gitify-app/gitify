var React = require('react');
var Reflux = require('reflux');
var Actions = require('../actions/actions');
var SearchStore = require('../stores/search');

var Search = React.createClass({
  mixins: [
    Reflux.connect(SearchStore, 'searchTerm')
  ],

  getInitialState: function () {
    return {
      searchTerm: ''
    };
  },

  updateSearchTerm: function (event) {
    console.log(event.target.value);
    this.setState({
      searchTerm: event.target.value
    });
    Actions.updateSearchTerm(event.target.value);
  },

  clearSearch: function () {
    Actions.clearSearchTerm();
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
              <div className="col-xs-10">
                <div className='form-group search-wrapper'>
                  <input
                    autoFocus
                    value={this.state.searchTerm}
                    onChange={this.updateSearchTerm}
                    className='form-control'
                    type='text'
                    placeholder=' Search...' />
                </div>
            </div>
            <div className="col-xs-2">
              {clearSearchIcon}
            </div>

          </div>) : null }
      </div>
    );
  }
});

module.exports = Search;
