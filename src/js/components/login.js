const { ipcRenderer } = require('electron');

import React from 'react';
import { connect } from 'react-redux';
import helpers from '../utils/helpers';

import { updateSetting, loginUser } from '../actions';

export class LoginPage extends React.Component {

  componentDidMount() {
    // TODO: Find a way to batch this....
    // Reset settings to default github info
    this.props.updateSetting('isEnterprise', false);
    this.props.updateSetting('baseUrl', 'github.com');
    this.props.updateSetting('clientId', '3fef4433a29c6ad8f22c');
    this.props.updateSetting('clientSecret', '9670de733096c15322183ff17ed0fc8704050379');
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isLoggedIn) {
      ipcRenderer.send('reopen-window');
      this.context.router.push('/notifications');
    }
  }

  routeToEnterpriseLogin = () => {
    this.context.router.push('/enterpriselogin');
  }

  render() {
    return (
      <div className="container-fluid main-container login">
        <div className="row">
          <div className="offset-xs-2 col-xs-8">
            <img className="img-responsive logo" src="images/gitify-logo-outline-dark.png" />
            <div className="desc">GitHub Notifications<br />in your menu bar.</div>
            <div className="row">
              <button
                className="btn btn-lg btn-block"
                onClick={helpers.authGithub.bind(this, this.props.settings, this.props.loginUser)}
              >
                <i className="fa fa-github" /> Log in to GitHub
              </button>
              <button
                  className="btn btn-lg btn-block"
                  onClick={this.routeToEnterpriseLogin}
              >
                <i className="fa fa-github" /> Enterprise
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

LoginPage.contextTypes = {
  router: React.PropTypes.object.isRequired
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
