const { ipcRenderer } = require('electron');

import React from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { authGithub } from '../utils/helpers';

import { updateSetting, loginUser } from '../actions';

export class LoginPage extends React.Component {

  componentDidMount() {
    // TODO: Find a way to batch this....
    // Reset settings to default github info
    this.props.updateSetting('isEnterprise', false);
    this.props.updateSetting('baseUrl', 'github.com');
    this.props.updateSetting('clientId', '');
    this.props.updateSetting('clientSecret', '');
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isLoggedIn) {
      ipcRenderer.send('reopen-window');
    }
  }

  render() {
    if (this.props.isLoggedIn) {
      return (
        <Redirect to="/" />
      );
    }

    return (
      <div className="container-fluid main-container login">
        <div className="row">
          <div className="offset-xs-2 col-xs-8">
            <img className="img-responsive logo" src="images/gitify-logo-outline-dark.png" />
            <div className="desc">GitHub Notifications<br />in your menu bar.</div>
            <div className="row">
              <button
                className="btn btn-lg btn-block github"
                onClick={() => authGithub(undefined, this.props.loginUser)}
              >
                <i className="fa fa-github" /> Log in to GitHub
              </button>

              <Link
                to="/enterpriselogin"
                className="btn btn-lg btn-block enterprise">
                <i className="fa fa-github" /> Enterprise
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export function mapStateToProps(state) {
  return {
    isLoggedIn: state.auth.get('token') !== null,
    failed: state.auth.get('failed'),
    isFetching: state.auth.get('isFetching'),
    settings: state.settings
  };
};

export default connect(mapStateToProps, { updateSetting, loginUser })(LoginPage);
