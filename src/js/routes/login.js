const { ipcRenderer } = require('electron');
import PropTypes from 'prop-types';

import React from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { authGithub, isUserEitherLoggedIn } from '../utils/helpers';
import LogoDark from '../components/logos/dark';
import Octicon, { markGithub } from 'octicons-react';

export class LoginPage extends React.Component {
  static propTypes = {
    isEitherLoggedIn: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.isEitherLoggedIn) {
      ipcRenderer.send('reopen-window');
    }
  }

  render() {
    if (this.props.isEitherLoggedIn) {
      return <Redirect to="/" />;
    }

    return (
      <div className="container-fluid main-container login">
        <LogoDark className="mt-5" />

        <div className="desc">GitHub Notifications<br />in your menu bar.</div>
        <button
          className="btn btn-block btn-login"
          onClick={() => authGithub(undefined, this.props.dispatch)}
        >
          <Octicon icon={markGithub} /> Login to GitHub
        </button>

        <Link to="/enterpriselogin" className="btn btn-block btn-login mt-3">
          <Octicon icon={markGithub} /> Login to GitHub Enterprise
        </Link>
      </div>
    );
  }
}

export function mapStateToProps(state) {
  return {
    isEitherLoggedIn: isUserEitherLoggedIn(state.auth),
  };
}

export default connect(mapStateToProps)(LoginPage);
