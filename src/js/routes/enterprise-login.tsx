const ipcRenderer = require('electron').ipcRenderer;

import * as React from 'react';
import { Form, FormRenderProps } from 'react-final-form';
import { connect } from 'react-redux';
import { ArrowLeftIcon } from '@primer/octicons-react';

import { AppState } from '../../types/reducers';
import { authGithub } from '../utils/helpers';
import { FieldInput } from '../components/fields/input';

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

        <button
          className="float-right px-4 py-2 mt-4 bg-gray-300 font-semibold rounded text-sm text-center hover:bg-gray-500 hover:text-white focus:outline-none"
          disabled={submitting || pristine}
          type="submit"
          title="Login Button"
        >
          <span>Login</span>
        </button>
      </form>
    );
  };

  handleSubmit(data, dispatch) {
    authGithub(data, dispatch);
  }

  render() {
    return (
      <div>
        <div className="flex justify-between items-center mt-4 py-2 mx-8">
          <button
            className="focus:outline-none"
            aria-label="Go Back"
            onClick={() => this.props.history.goBack()}
          >
            <ArrowLeftIcon size={20} className="hover:text-gray-400" />
          </button>

          <h3 className="text-lg font-semibold">
            Login with GitHub Enterprise
          </h3>
        </div>

        <div className="flex-1 px-8">
          <Form
            initialValues={{
              hostname: '',
              clientId: '',
              clientSecret: '',
            }}
            onSubmit={(data) => this.handleSubmit(data, this.props.dispatch)}
            validate={validate}
          >
            {this.renderForm}
          </Form>
        </div>
      </div>
    );
  }
}

export function mapStateToProps(state: AppState) {
  return {
    enterpriseAccountsCount: state.auth.enterpriseAccounts.length,
  };
}

export default connect(mapStateToProps, null)(EnterpriseLogin);
