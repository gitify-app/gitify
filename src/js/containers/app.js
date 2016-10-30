import React from 'react';
import { connect } from 'react-redux';

import { fetchNotifications } from '../actions';
import Sidebar from '../components/sidebar';
import NetworkStatus from '../components/network-status';

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
      <div>
        <Sidebar
          location={this.props.location}
          toggleSearch={() => this.toggleSearch()} />
        {this.props.children}
      </div>
    );
  };
};

export default connect(null, { fetchNotifications })(App);
