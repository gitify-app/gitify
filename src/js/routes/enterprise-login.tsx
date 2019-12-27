const ipcRenderer = require('electron').ipcRenderer;

import * as React from 'react';
import { Form, FormRenderProps } from 'react-final-form';
import { connect } from 'react-redux';
import Octicon, { MarkGithub } from '@primer/octicons-react';
import styled from 'styled-components';

import { AppState } from '../../types/reducers';
import { authGithub } from '../utils/helpers';
import { FieldInput } from '../components/fields/input';
import { LoginButton } from './login';

const Wrapper = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h3`
  margin: 0;
  font-weight: 500;
`;

const ButtonClose = styled.button`
  border: 0;
  padding: 0.25rem;
  font-size: 2rem;
  font-weight: 500;

  &:hover {
    cursor: pointer;
    color: ${props => props.theme.primary};
  }
`;

interface IValues {
  hostname?: string;
  clientId?: string;
  clientSecret?: string;
}

interface IFormErrors {
  hostname?: string;
  clientId?: string;
  clientSecret?: string;
}

export const validate = (values: IValues): IFormErrors => {
  const errors: IFormErrors = {};
  if (!values.hostname) {
    errors.hostname = 'Required';
  } else if (
    !/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/i.test(
      values.hostname
    )
  ) {
    errors.hostname = 'Invalid hostname.';
  }

  if (!values.clientId) {
    // 20
    errors.clientId = 'Required';
  } else if (!/^[A-Z0-9]{20}$/i.test(values.clientId)) {
    errors.clientId = 'Invalid client id.';
  }

  if (!values.clientSecret) {
    // 40
    errors.clientSecret = 'Required';
  } else if (!/^[A-Z0-9]{40}$/i.test(values.clientSecret)) {
    errors.clientSecret = 'Invalid client secret.';
  }

  return errors;
};

interface IProps {
  history: any;
  dispatch: any;
  enterpriseAccountsCount: number;
}

interface IState {
  enterpriseAccountsCount: number;
}

export class EnterpriseLogin extends React.Component<IProps, IState> {
  state = {
    enterpriseAccountsCount: 0,
  };

  static getDerivedStateFromProps(props: IProps, state) {
    if (props.enterpriseAccountsCount > state.enterpriseAccountsCount) {
      ipcRenderer.send('reopen-window');
      props.history.goBack();
    }

    return {
      enterpriseAccountsCount: props.enterpriseAccountsCount,
    };
  }

  renderForm = (formProps: FormRenderProps) => {
    const { handleSubmit, submitting, pristine } = formProps;

    return (
      <form onSubmit={handleSubmit}>
        <FieldInput
          name="hostname"
          label="Hostname"
          placeholder="github.company.com"
        />

        <FieldInput name="clientId" label="Client ID" placeholder="123456789" />

        <FieldInput
          name="clientSecret"
          label="Client Secret"
          placeholder="ABC123DEF456"
        />

        <LoginButton
          disabled={submitting || pristine}
          type="submit"
          title="Login Button"
        >
          <Octicon icon={MarkGithub} size={16} />
          <span>Login to GitHub Enterprise</span>
        </LoginButton>
      </form>
    );
  };

  handleSubmit(data, dispatch) {
    authGithub(data, dispatch);
  }

  render() {
    return (
      <Wrapper>
        <Header>
          <Title>Login to GitHub Enterprise</Title>

          <ButtonClose
            aria-label="Go Back"
            onClick={() => this.props.history.goBack()}
          >
            &times;
          </ButtonClose>
        </Header>

        <Form
          initialValues={{
            hostname: '',
            clientId: '',
            clientSecret: '',
          }}
          onSubmit={data => this.handleSubmit(data, this.props.dispatch)}
          validate={validate}
        >
          {this.renderForm}
        </Form>
      </Wrapper>
    );
  }
}

export function mapStateToProps(state: AppState) {
  return {
    enterpriseAccountsCount: state.auth.enterpriseAccounts.length,
  };
}

export default connect(mapStateToProps, null)(EnterpriseLogin);
