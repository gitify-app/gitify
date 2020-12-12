const { ipcRenderer } = require('electron');

import * as React from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import { AppState } from '../../types/reducers';
import { authGithub, isUserEitherLoggedIn } from '../utils/helpers';
import { Logo } from '../components/ui/logo';

interface IProps {
  isEitherLoggedIn: boolean;
  dispatch: any;
  history: any;
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

    const loginButtonClass =
      'w-48 py-2 my-2 bg-gray-300 font-semibold rounded text-xs text-center hover:bg-gray-500 hover:text-white focus:outline-none';

    return (
      <div className="flex flex-1 flex-col justify-center items-center p-4">
        <Logo className="w-16 h-16" isDark />

        <div className="my-4 px-2.5 py-1.5 font-semibold text-center">
          GitHub Notifications <br /> in your menu bar.
        </div>

        <button
          className={loginButtonClass}
          onClick={() => authGithub(undefined, this.props.dispatch)}
          aria-label="Login with GitHub"
        >
          <span>Login to GitHub</span>
        </button>

        <button
          className={loginButtonClass}
          onClick={() => this.props.history.push('/enterpriselogin')}
          aria-label="Login with GitHub Enterprise"
        >
          <span>Login to GitHub Enterprise</span>
        </button>
      </div>
    );
  }
}

export function mapStateToProps(state: AppState) {
  return {
    isEitherLoggedIn: isUserEitherLoggedIn(state.auth),
  };
}

export default connect(mapStateToProps)(LoginPage);
