const ipcRenderer = require('electron').ipcRenderer;

import {
  ArrowLeftIcon,
  BookIcon,
  PersonIcon,
  SignInIcon,
} from '@primer/octicons-react';

import { type FC, useCallback, useContext } from 'react';
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

export const LoginEnterpriseRoute: FC = () => {
  const { loginEnterprise } = useContext(AppContext);
  const navigate = useNavigate();

  const renderForm = (formProps: FormRenderProps) => {
    const { handleSubmit, submitting, pristine, values } = formProps;

    return (
      <form onSubmit={handleSubmit}>
        <FieldInput
          name="hostname"
          label="Hostname"
          placeholder="github.company.com"
          helpText={
            <div>
              <div className="mb-1">
                <Button
                  name="Create new OAuth App"
                  label="Create new OAuth App"
                  class="px-2 py-1 text-xs"
                  disabled={!values.hostname}
                  icon={PersonIcon}
                  size={12}
                  url={getNewOAuthAppURL(values.hostname)}
                />{' '}
                then{' '}
                <span className="italic">generate a new client secret</span>.
              </div>
            </div>
          }
        />

        <FieldInput name="clientId" label="Client ID" placeholder="123456789" />

        <FieldInput
          name="clientSecret"
          label="Client Secret"
          placeholder="ABC123DEF456"
        />

        <div className="flex justify-between items-center">
          <div className="text-xs italic hover:text-blue-500 justify-center items-center">
            <Button
              name="Docs"
              label="GitHub Docs"
              class="px-2 py-1 text-xs"
              icon={BookIcon}
              size={12}
              url={Constants.GITHUB_DOCS.OAUTH_URL}
            />
          </div>
          <div className="justify-center items-center">
            <Button
              name="Login"
              label="Login"
              class="float-right px-4 py-2 my-4"
              icon={SignInIcon}
              size={14}
              disabled={submitting || pristine}
              type="submit"
            />
          </div>
        </div>
      </form>
    );
  };

  const login = useCallback(async (data: IValues) => {
    try {
      await loginEnterprise(data as AuthOptions);
      navigate(-1);
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
