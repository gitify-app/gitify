import React from 'react';
import { connect } from 'react-redux';

import { fetchNotifications } from '../actions';
import Loading from '../components/loading';
import Sidebar from '../components/sidebar';

export class App extends React.Component {
  render() {
    return (
      <div className="wrapper">
        <Loading isLoading={this.props.isFetching} />
        <Sidebar />
        {this.props.children}
      </div>
    );
  };
};

function mapStateToProps(state) {
  return {
    isFetching: state.notifications.get('isFetching')
  };
};

export default connect(mapStateToProps, { fetchNotifications })(App);
