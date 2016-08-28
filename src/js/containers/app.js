import React from 'react';
import { connect } from 'react-redux';

import { fetchNotifications } from '../actions';
import Navigation from '../components/navigation';
import NetworkStatus from '../components/network-status';
import SearchBar from '../components/search';

export class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showSearch: false,
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

  toggleSearch() {
    this.setState({
      showSearch: !this.state.showSearch
    });
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
        <Navigation
          location={this.props.location}
          toggleSearch={this.toggleSearch.bind(this)}
          showSearch={this.state.showSearch} />
        <SearchBar showSearch={this.state.showSearch} />
        {this.props.children}
      </div>
    );
  };
};

export default connect(null, { fetchNotifications })(App);
