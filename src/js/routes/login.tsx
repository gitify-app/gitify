const { ipcRenderer } = require('electron');

import * as React from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

import { authGithub, isUserEitherLoggedIn } from '../utils/helpers';
import { LogoDark } from '../components/logos/dark';

interface IProps {
  isEitherLoggedIn: boolean;
  dispatch: any;
}

export class LoginPage extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      isEitherLoggedIn: props.isEitherLoggedIn,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.isEitherLoggedIn) {
      ipcRenderer.send('reopen-window');
    }
    return {
      isEitherLoggedIn: props.isEitherLoggedIn,
    };
  }

  render() {
    if (this.props.isEitherLoggedIn) {
      return <Redirect to="/" />;
    }

    return (
      <div className="container-fluid main-container login">
        <LogoDark className="mt-5" />

        <div className="desc">
          GitHub Notifications
          <br />
          in your menu bar.
        </div>
        <button
          className="btn btn-block btn-login"
          onClick={() => authGithub(undefined, this.props.dispatch)}
        >
          <FontAwesomeIcon className="mr-2" icon={faGithub} title="GitHub" />{' '}
          Login to GitHub
        </button>

        <Link to="/enterpriselogin" className="btn btn-block btn-login mt-3">
          <FontAwesomeIcon className="mr-2" icon={faGithub} title="GitHub" />{' '}
          Login to GitHub Enterprise
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
