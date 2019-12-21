const ipcRenderer = require('electron').ipcRenderer;

import * as React from 'react';
import { Link } from 'react-router-dom';
import { reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

import { authGithub } from '../utils/helpers';

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

const renderField = ({
  input,
  label,
  placeholder,
  meta: { touched, error },
}) => (
  <div className={touched && error ? 'form-group has-danger' : 'form-group'}>
    <label htmlFor={input.name}>{label}</label>
    <div>
      <input
        {...input}
        className="form-control"
        placeholder={placeholder}
        type="text"
      />

      {touched && error && <div className="form-control-feedback">{error}</div>}
    </div>
  </div>
);

interface IProps {
  history: any;
  enterpriseAccountsCount: number;
  handleSubmit: (data: any) => any;
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

        <form onSubmit={this.props.handleSubmit(this.handleSubmit)}>
          <Field
            name="hostname"
            component={renderField}
            label="Host Name"
            placeholder="github.company.com"
          />

          <Field
            name="clientId"
            component={renderField}
            label="Client ID"
            placeholder="123456789"
          />

          <Field
            name="clientSecret"
            component={renderField}
            label="Client Secret"
            placeholder="ABC123DEF456"
          />

          <button className="btn btn-md btn-login mt-2" type="submit">
            <FontAwesomeIcon icon={faGithub} title="GitHub" /> Login to GitHub
            Enterprise
          </button>
        </form>
      </div>
    );
  }
}

export function mapStateToProps(state) {
  return {
    enterpriseAccountsCount: state.auth.get('enterpriseAccounts').size,
  };
}

export default connect(
  mapStateToProps,
  null
)(
  reduxForm({
    form: 'loginEnterprise',
    // Use for development
    // initialValues: {
    //   hostname: 'github.example.com',
    //   clientId: '1231231231',
    //   clientSecret: 'ABC123ABCDABC123ABCDABC123ABCDABC123ABCD',
    // },
    validate,
  })(EnterpriseLogin)
);
