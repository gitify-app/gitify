const { ipcRenderer } = require('electron');

import * as React from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { AppState } from '../../types/reducers';
import { authGithub, isUserEitherLoggedIn } from '../utils/helpers';
import { Logo } from '../components/ui/logo';

const Wrapper = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;

  .logo {
    max-width: 5rem;
    margin-top: 1rem;
  }
`;

const Title = styled.h3`
  margin: 1rem 0;
  padding: 10px 5px;
  font-weight: 400;
  text-align: center;
`;

export const LoginButton = styled.button`
  font-size: 0.85rem;
  border-radius: 5px;
  border: 1px solid ${(props) => props.theme.primary};

  padding: 0.5rem 1rem;
  margin: 0.5rem 0;
  min-width: 16rem;
  display: flex;
  justify-content: center;
  align-items: center;

  background-color: ${(props) => props.theme.grayDark};
  color: white;

  &:hover {
    background-color: ${(props) => props.theme.grayDarker};
  }

  span {
    margin-left: 0.5rem;
  }
`;

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

    return (
      <Wrapper>
        <Logo isDark />

        <Title>
          GitHub Notifications <br /> in your menu bar.
        </Title>

        <LoginButton
          onClick={() => authGithub(undefined, this.props.dispatch)}
          aria-label="Login with GitHub"
        >
          <span>Login to GitHub</span>
        </LoginButton>

        <LoginButton
          onClick={() => this.props.history.push('/enterpriselogin')}
          aria-label="Login with GitHub Enterprise"
        >
          <span>Login to GitHub Enterprise</span>
        </LoginButton>
      </Wrapper>
    );
  }
}

export function mapStateToProps(state: AppState) {
  return {
    isEitherLoggedIn: isUserEitherLoggedIn(state.auth),
  };
}

export default connect(mapStateToProps)(LoginPage);
