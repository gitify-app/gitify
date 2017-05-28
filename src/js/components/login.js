const { ipcRenderer } = require('electron');

import React from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { authGithub, isUserEitherLoggedIn } from '../utils/helpers';

export class LoginPage extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.isEitherLoggedIn) {
      ipcRenderer.send('reopen-window');
    }
  }

  render() {
    if (this.props.isEitherLoggedIn) {
      return (
        <Redirect to="/" />
      );
    }

    return (
      <div className="container-fluid main-container login">
        <img className="img-responsive logo" src="images/gitify-logo-outline-dark.png" />
        <div className="desc">GitHub Notifications<br />in your menu bar.</div>
        <button
          className="btn btn-block btn-login"
          onClick={() => authGithub(undefined, this.props.dispatch)}
        >
          <i className="fa fa-github mr-2" /> Login to GitHub
        </button>

        <Link
          to="/enterpriselogin"
          className="btn btn-block btn-login mt-3">
          <i className="fa fa-github mr-2" /> Login to GitHub Enterprise
        </Link>
      </div>
    );
  }
};

export function mapStateToProps(state) {
  return {
    isEitherLoggedIn: isUserEitherLoggedIn(state.auth),
  };
};

export default connect(mapStateToProps)(LoginPage);
