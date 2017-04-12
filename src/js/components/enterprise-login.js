const ipcRenderer = require('electron').ipcRenderer;

import React from 'react';
import { Link } from 'react-router-dom';
import { reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';

import { loginUser } from '../actions';
import { authGithub } from '../utils/helpers';

const renderField = ({ input, label, placeholder, meta: { touched, error, warning } }) => (
  <div className="form-group">
    <label htmlFor={input.name}>{label}</label>
    <div>
      <input {...input} className="form-control" placeholder={placeholder} type="text" />
      {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
    </div>
  </div>
);

export class EnterpriseLogin extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.isLoggedIn) {
      ipcRenderer.send('reopen-window');
      // FIXME! <Redirect /> from react-router
      this.context.router.push('/notifications');
    }
  }

  handleSubmit(data, dispatch) {
    authGithub(data, dispatch(loginUser));
  }

  render() {
    return (
      <div className="container-fluid main-container settings">
        <Link
          to="/login"
          className="btn btn-lg btn-block enterprise"
          replace
        >
          <i className="fa fa-angle-left" /> Back
        </Link>

        <form onSubmit={this.props.handleSubmit(this.handleSubmit)}>
          <Field
            name="hostname"
            component={renderField}
            label="Host Name"
            placeholder="github.company.com" />

          <Field
            name="clientId"
            component={renderField}
            label="Client ID"
            placeholder="123456789" />

          <Field
            name="clientSecret"
            component={renderField}
            label="Client Secret"
            placeholder="ABC123DEF456" />

          <button className="btn btn-md" type="submit">
            <i className="fa fa-github" /> Login to GitHub Enterprise
          </button>
        </form>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    isLoggedIn: state.auth.get('token') !== null,
    settings: state.settings
  };
};

export default connect(mapStateToProps, null)(reduxForm({
  form: 'loginEnterprise',
  initialValues: {
    hostname: 'github.example.com',
    clientId: '123123123',
    clientSecret: 'ABC123ABC123',
  },
})(EnterpriseLogin));
