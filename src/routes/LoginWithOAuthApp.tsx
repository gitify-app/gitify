import {
  ArrowLeftIcon,
  BookIcon,
  PersonIcon,
  SignInIcon,
} from '@primer/octicons-react';
import ipcRenderer from 'electron';
import { type FC, useCallback, useContext, useEffect } from 'react';
import { Form, type FormRenderProps } from 'react-final-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/fields/Button';
import { FieldInput } from '../components/fields/FieldInput';
import { AppContext } from '../context/App';
import type { LoginOAuthAppOptions } from '../utils/auth/types';
import {
  getNewOAuthAppURL,
  isValidClientId,
  isValidHostname,
  isValidToken,
} from '../utils/auth/utils';
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
  } else if (!isValidHostname(values.hostname)) {
    errors.hostname = 'Invalid hostname.';
  }

  if (!values.clientId) {
    errors.clientId = 'Required';
  } else if (!isValidClientId(values.clientId)) {
    errors.clientId = 'Invalid client id.';
  }

  if (!values.clientSecret) {
    errors.clientSecret = 'Required';
  } else if (!isValidToken(values.clientSecret)) {
    errors.clientSecret = 'Invalid client secret.';
  }

  return errors;
};

export const LoginWithOAuthApp: FC = () => {
  const {
    auth: { enterpriseAccounts },
    loginWithOAuthApp: loginEnterprise,
  } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (enterpriseAccounts.length) {
      ipcRenderer.ipcRenderer.send('reopen-window');
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
                icon={PersonIcon}
                size={12}
                url={getNewOAuthAppURL(values.hostname)}
              />
              <span className="mx-1">on GitHub then paste your</span>
              <span className="italic">client id and client secret</span> below.
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
            class="mt-2"
            icon={BookIcon}
            size={12}
            url={Constants.GITHUB_DOCS.OAUTH_URL}
          />

          <Button
            name="Login"
            label="Login"
            class="px-4 py-2 mt-2 !text-sm"
            icon={SignInIcon}
            size={16}
            disabled={submitting || pristine}
            type="submit"
          />
        </div>
      </form>
    );
  };

  const login = useCallback(async (data: IValues) => {
    try {
      await loginEnterprise(data as LoginOAuthAppOptions);
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
          <PersonIcon size={20} className="mr-2" />
          Login with OAuth App
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
