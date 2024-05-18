const ipcRenderer = require('electron').ipcRenderer;

import {
  ArrowLeftIcon,
  BookIcon,
  PersonIcon,
  SignInIcon,
} from '@primer/octicons-react';

import { type FC, useCallback, useContext, useEffect } from 'react';
import { Form, type FormRenderProps } from 'react-final-form';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/fields/Button';
import { FieldInput } from '../components/fields/FieldInput';
import { AppContext } from '../context/App';
import type { AuthOptions } from '../types';
import { getNewOAuthAppURL } from '../utils/auth';
import Constants from '../utils/constants';

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

export const LoginWithOAuthApp: FC = () => {
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
    const { handleSubmit, submitting, pristine, values } = formProps;

    return (
      <form onSubmit={handleSubmit}>
        <FieldInput
          name="hostname"
          label="Hostname"
          placeholder="github.company.com"
          helpText={
            <div className="mb-1">
              <Button
                name="Create new OAuth App"
                label="Create new OAuth App"
                disabled={!values.hostname}
                class="px-1 py-1 my-0"
                icon={PersonIcon}
                size={12}
                url={getNewOAuthAppURL(values.hostname)}
              />{' '}
              then <span className="italic">generate a new client secret</span>.
            </div>
          }
        />

        <FieldInput name="clientId" label="Client ID" placeholder="123456789" />

        <FieldInput
          name="clientSecret"
          label="Client Secret"
          placeholder="ABC123DEF456"
        />

        <div className="flex justify-between items-end">
          <Button
            name="Docs"
            label="GitHub Docs"
            class="py-1"
            icon={BookIcon}
            size={12}
            url={Constants.GITHUB_DOCS.OAUTH_URL}
          />

          <Button
            name="Login"
            label="Login"
            class="px-4 py-2 mt-4"
            icon={SignInIcon}
            size={14}
            disabled={submitting || pristine}
            type="submit"
          />
        </div>
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
          type="button"
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

        <h3 className="text-lg font-semibold justify-center">
          <PersonIcon /> Login with OAuth App
        </h3>
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
