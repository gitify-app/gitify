const ipcRenderer = require('electron').ipcRenderer;

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';
import Octicon, { markGithub, x } from 'octicons-react';

import { authGithub } from '../utils/helpers';

export const validate = values => {
  const errors = {};
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

const renderField = (
  { input, label, placeholder, meta: { touched, error } } // eslint-disable-line react/prop-types
) =>
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
  </div>;

export class EnterpriseLogin extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    enterpriseAccounts: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
  };

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.enterpriseAccounts.size > this.props.enterpriseAccounts.size
    ) {
      ipcRenderer.send('reopen-window');
      this.props.history.goBack();
    }
  }

  handleSubmit(data, dispatch) {
    authGithub(data, dispatch);
  }

  render() {
    return (
      <div className="container-fluid main-container login">
        <div className="d-flex flex-row-reverse">
          <Link to="/login" className="btn btn-close" replace>
            <Octicon icon={x} />
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
            <Octicon icon={markGithub} /> Login to GitHub Enterprise
          </button>
        </form>
      </div>
    );
  }
}

export function mapStateToProps(state) {
  return {
    enterpriseAccounts: state.auth.get('enterpriseAccounts'),
  };
}

export default connect(mapStateToProps, null)(
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
