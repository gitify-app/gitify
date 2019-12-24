const ipcRenderer = require('electron').ipcRenderer;

import * as React from 'react';
import { Link } from 'react-router-dom';
import { Form, FormRenderProps } from 'react-final-form';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

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
          className="btn btn-md btn-login mt-2"
          disabled={submitting || pristine}
          type="submit"
        >
          <FontAwesomeIcon icon={faGithub} title="GitHub" /> Login to GitHub
          Enterprise
        </button>
      </form>
    );
  };

  handleSubmit(data, dispatch) {
    authGithub(data, dispatch);
  }

  render() {
    return (
      <div className="container-fluid main-container login">
        <div className="d-flex flex-row-reverse">
          <Link to="/login" className="btn btn-close" replace>
            <FontAwesomeIcon icon={faTimes} title="Close" />
          </Link>
        </div>

        <div className="desc">Login to GitHub Enterprise.</div>

        <Form
          initialValues={{
            hostname: '',
            clientId: '',
            clientSecret: '',
          }}
          // @ts-ignore
          onSubmit={data => this.handleSubmit(data, this.props.dispatch)}
          validate={validate}
        >
          {this.renderForm}
        </Form>
      </div>
    );
  }
}

export function mapStateToProps(state) {
  return {
    enterpriseAccountsCount: state.auth.get('enterpriseAccounts').size,
  };
}

export default connect(mapStateToProps, null)(EnterpriseLogin);
