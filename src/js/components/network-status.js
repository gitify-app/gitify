import React from 'react';

export default class NetworkStatus extends React.Component {
  render() {
    return (
      <div className="network-status">
        <img className="img-fluid logo" src="images/gitify-logo-outline-dark.png" />
        <h4>No Internet Connection</h4>
        <div className="alert alert-danger">Couldn't establish an internet connection.</div>
      </div>
    );
  }
};
