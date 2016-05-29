import React from 'react';
import { connect } from 'react-redux';

import { searchNotifications, clearSearch } from '../actions';

export class SearchBar extends React.Component {

  componentWillReceiveProps(nextProps) {
    if (nextProps.showSearch === false) {
      this.props.clearSearch();
    }
  }

  render() {
    if (!this.props.showSearch) {
      return null;
    }

    var clearSearchIcon;

    if (this.props.query) {
      clearSearchIcon = (
        <span className="octicon octicon-x" onClick={this.props.clearSearch} />
      );
    }

    return (
      <div className="row search-form">
        <div className="col-xs-10">
          <input
            autoFocus
            value={this.props.query}
            onChange={(evt) => this.props.searchNotifications(evt.target.value)}
            className="form-control form-control-sm"
            type="text"
            placeholder=" Search..." />
        </div>
        <div className="col-xs-2">
          {clearSearchIcon}
        </div>
      </div>
    );
  }
};


function mapStateToProps(state) {
  return {
    query: state.searchFilter.query
  };
};

export default connect(mapStateToProps, { searchNotifications, clearSearch })(SearchBar);
