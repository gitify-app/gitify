var ipcRenderer = window.require('electron').ipcRenderer;

import React from 'react';
import helpers from '../utils/helpers';
import { connect } from 'react-redux';
import { updateSetting, loginUser } from '../actions';

class EnterpriseLogin extends React.Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  componentWillReceiveProps(nextProps) {
    const isLoggedIn = nextProps.token !== null;
    if (isLoggedIn) {
      ipcRenderer.send('reopen-window');
      this.context.router.push('/notifications');
    }
  }

  componentDidMount() {
    // We want to know whether or not we are loading as enterprise
    this.props.updateSetting('isEnterprise', true);
  }

  toggleSetting(key, event) {
    this.props.updateSetting(key, event.target.value);
  }

  handleLoginClick = () => {
    helpers.authGithub(this.props.settings, this.props.loginUser);
  }

  routeToLogin = () => {
    this.context.router.push('/login');
  }

  render() {
    return (
      <div className="container-fluid main-container settings">
        <ul className="nav nav-pills">
          <li className="nav-item">
            <a className="nav-link" onClick={this.routeToLogin}>
              <i className="fa fa-arrow-left" /> Back to login page
            </a>
          </li>
        </ul>

        <div className="row setting">
          <div className="col-xs-4">Base Url</div>
          <div className="col-xs-8">
            <input
              className="form-control"
              placeholder="github.company.com"
              onChange={this.toggleSetting.bind(this, 'baseUrl')}
            />
          </div>
        </div>
        <div className="row setting">
          <div className="col-xs-4">Client ID</div>
          <div className="col-xs-8">
            <input
              className="form-control"
              placeholder="24084b7c891c8a7a0385"
              onChange={this.toggleSetting.bind(this, 'clientId')}
            />
          </div>
        </div>
        <div className="row setting">
          <div className="col-xs-4">Secret</div>
          <div className="col-xs-8">
            <input
              className="form-control"
              placeholder="177537vsrh5u54u2ht43y2yfhsr"
              onChange={this.toggleSetting.bind(this, 'clientSecret')}
            />
          </div>
        </div>

        <div className="row footer">
          <div className="col-xs-12 text-center">
            <button className="btn btn-md" onClick={this.handleLoginClick}>
              <i className="fa fa-github" />Login to GitHub enterprise
            </button>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    token: state.auth.token,
    settings: state.settings
  };
};

export default connect(mapStateToProps, {
  updateSetting,
  loginUser
})(EnterpriseLogin);
