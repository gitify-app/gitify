import { BookIcon, PersonIcon, SignInIcon } from '@primer/octicons-react';
import { type FC, useCallback, useContext } from 'react';
import { Form, type FormRenderProps } from 'react-final-form';
import { Header } from '../components/Header';
import { Button } from '../components/buttons/Button';
import { FieldInput } from '../components/fields/FieldInput';
import { AppContext } from '../context/App';
import type { ClientID, ClientSecret, Hostname, Token } from '../types';
import type { LoginOAuthAppOptions } from '../utils/auth/types';
import {
  getNewOAuthAppURL,
  isValidClientId,
  isValidHostname,
  isValidToken,
} from '../utils/auth/utils';
import Constants from '../utils/constants';

interface IValues {
  hostname?: Hostname;
  clientId?: ClientID;
  clientSecret?: ClientSecret;
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
  } else if (!isValidToken(values.clientSecret as unknown as Token)) {
    errors.clientSecret = 'Invalid client secret.';
  }

  return errors;
};

export const LoginWithOAuthApp: FC = () => {
  const { loginWithOAuthApp } = useContext(AppContext);

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

        <div className="flex items-end justify-between">
          <Button
            name="Docs"
            label="GitHub Docs"
            className="mt-2"
            icon={BookIcon}
            size={12}
            url={Constants.GITHUB_DOCS.OAUTH_URL}
          />

          <Button
            name="Login"
            label="Login"
            className="mt-2 px-4 py-2 !text-sm"
            icon={SignInIcon}
            size={16}
            disabled={submitting || pristine}
            type="submit"
          />
        </div>
      </form>
    );
  };

  const login = useCallback(
    async (data: IValues) => {
      try {
        await loginWithOAuthApp(data as LoginOAuthAppOptions);
      } catch (err) {
        // Skip
      }
    },
    [loginWithOAuthApp],
  );

  return (
    <div>
      <Header>
        <PersonIcon size={20} className="mr-2" />
        Login with OAuth App
      </Header>
      <div className="px-8">
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
