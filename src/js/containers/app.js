import React from 'react';
import { connect } from 'react-redux';

import { fetchNotifications } from '../actions';
import Loading from '../components/loading';
import NetworkStatus from '../components/network-status';
import Sidebar from '../components/sidebar';

export class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      networkConnected: navigator.onLine
    };
  }

  componentDidMount() {
    const self = this;
    window.addEventListener('offline', function(e) { self.handleNetworkStatus(); });
    window.addEventListener('online', function(e) { self.handleNetworkStatus(); });
  }

  componentWillUnmount() {
    window.removeEventListener('offline', this.handleNetworkStatus);
    window.removeEventListener('online', this.handleNetworkStatus);
  }

  handleNetworkStatus() {
    if (navigator.onLine) {
      this.setState({
        networkConnected: true
      });
      this.props.fetchNotifications();
    } else {
      this.setState({
        networkConnected: false
      });
    }
  }

  render() {
    if (!this.state.networkConnected) {
      return <NetworkStatus />;
    }

    return (
      <div className="wrapper">
        <Loading isLoading={this.props.isFetching} />
        <Sidebar
          location={this.props.location}
          toggleSearch={() => this.toggleSearch()} />
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
