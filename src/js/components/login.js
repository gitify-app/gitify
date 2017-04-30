const { ipcRenderer } = require('electron');

import React from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { authGithub } from '../utils/helpers';

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
          className="btn btn-lg btn-block github"
          onClick={() => authGithub(undefined, this.props.dispatch)}
        >
          <i className="fa fa-github" /> Log in to GitHub
        </button>

        <Link
          to="/enterpriselogin"
          className="btn btn-lg btn-block enterprise">
          <i className="fa fa-github" /> Enterprise
        </Link>
      </div>
    );
  }
};

export function mapStateToProps(state) {
  return {
    isEitherLoggedIn: state.auth.get('token') !== null || state.auth.get('enterpriseAccounts').size > 0,
  };
};

export default connect(mapStateToProps)(LoginPage);
