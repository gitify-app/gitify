const ipcRenderer = require('electron').ipcRenderer;

import React, { useCallback, useContext, useEffect } from 'react';
import { Form, FormRenderProps } from 'react-final-form';
import { ArrowLeftIcon } from '@primer/octicons-react';
import { useNavigate } from 'react-router-dom';

import { AppContext } from '../context/App';
import { FieldInput } from '../components/fields/FieldInput';
import { AuthOptions } from '../types';

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
      values.hostname,
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

export const LoginEnterpriseRoute: React.FC = () => {
  const {
    accounts: { enterpriseAccounts },
    loginEnterprise,
  } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (enterpriseAccounts.length) {
      ipcRenderer.send('reopen-window');
      navigate(-1);
    }
  }, [enterpriseAccounts]);

  const renderForm = (formProps: FormRenderProps) => {
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
          className="float-right px-4 py-2 my-4 bg-gray-300 font-semibold rounded text-sm text-center hover:bg-gray-500 hover:text-white dark:text-black focus:outline-none"
          title="Login Button"
          disabled={submitting || pristine}
          type="submit"
        >
          Login
        </button>
      </form>
    );
  };

  const login = useCallback(async (data: IValues) => {
    try {
      await loginEnterprise(data as AuthOptions);
    } catch (err) {
      // Skip
    }
  }, []);

  return (
    <div className="flex-1 bg-white dark:bg-gray-dark dark:text-white">
      <div className="flex justify-between items-center mt-4 py-2 mx-8">
        <button
          className="focus:outline-none"
          title="Go Back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon
            size={20}
            className="hover:text-gray-400"
            aria-label="Go Back"
          />
        </button>

        <h3 className="text-lg font-semibold">Login with GitHub Enterprise</h3>
      </div>

      <div className="flex-1 px-8">
        <Form
          initialValues={{
            hostname: '',
            clientId: '',
            clientSecret: '',
          }}
          onSubmit={login}
          validate={validate}
        >
          {renderForm}
        </Form>
      </div>
    </div>
  );
};
