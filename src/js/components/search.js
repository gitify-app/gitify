import React from 'react';
// import Reflux from 'reflux';

var Actions = {}; // FIXME!
// var SearchStore = require('../stores/search');

export default class SearchBar extends React.Component {
  // mixins: [
  //   Reflux.connect(SearchStore, 'searchTerm')
  // ],

  constructor(props) {
    super(props);
    this.state = {
      searchTerm: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.showSearch === false) {
      this.setState({
        searchTerm: ''
      });
      Actions.updateSearchTerm('');
    }
  }

  updateSearchTerm(event) {
    this.setState({
      searchTerm: event.target.value
    });
    Actions.updateSearchTerm(event.target.value);
  }

  clearSearch() {
    Actions.clearSearchTerm();
  }

  render() {
    var clearSearchIcon;

    if (this.state.searchTerm) {
      clearSearchIcon = (
        <span className="octicon octicon-x" onClick={this.clearSearch} />
      );
    }

    return (
      <div className={this.props.showSearch ? 'container-fluid search-bar' : 'container-fluid' }>
        {this.props.showSearch ? (
            <div className="row">
              <div className="col-xs-10">
                <div className="form-group search-wrapper">
                  <input
                    autoFocus
                    value={this.state.searchTerm}
                    onChange={this.updateSearchTerm}
                    className="form-control"
                    type="text"
                    placeholder=" Search..." />
                </div>
            </div>
            <div className="col-xs-2">
              {clearSearchIcon}
            </div>

          </div>) : null }
      </div>
    );
  }
};
