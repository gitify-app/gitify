import { BookIcon, KeyIcon, SignInIcon } from '@primer/octicons-react';
import { type FC, useCallback, useContext, useState } from 'react';
import { Form, type FormRenderProps } from 'react-final-form';
import { useNavigate } from 'react-router-dom';

import { logError } from '../../shared/logger';
import { Header } from '../components/Header';
import { Button } from '../components/buttons/Button';
import { FieldInput } from '../components/fields/FieldInput';
import { AppContext } from '../context/App';
import { type Hostname, Size, type Token } from '../types';
import type { LoginPersonalAccessTokenOptions } from '../utils/auth/types';
import {
  getNewTokenURL,
  isValidHostname,
  isValidToken,
} from '../utils/auth/utils';
import { Constants } from '../utils/constants';

interface IValues {
  token?: Token;
  hostname?: Hostname;
}

interface IFormErrors {
  token?: string;
  hostname?: string;
}

export const validate = (values: IValues): IFormErrors => {
  const errors: IFormErrors = {};

  if (!values.hostname) {
    errors.hostname = 'Required';
  } else if (!isValidHostname(values.hostname)) {
    errors.hostname = 'Invalid hostname.';
  }

  if (!values.token) {
    errors.token = 'Required';
  } else if (!isValidToken(values.token)) {
    errors.token = 'Invalid token.';
  }

  return errors;
};

export const LoginWithPersonalAccessTokenRoute: FC = () => {
  const { loginWithPersonalAccessToken } = useContext(AppContext);
  const navigate = useNavigate();
  const [isValidToken, setIsValidToken] = useState<boolean>(true);

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
              <div className="mt-1 italic">
                Change only if you are using GitHub Enterprise Server.
              </div>
              <div className="mt-3">
                <Button
                  label="Generate a PAT"
                  disabled={!values.hostname}
                  icon={{ icon: KeyIcon, size: Size.XSMALL }}
                  url={getNewTokenURL(values.hostname)}
                  size="xs"
                >
                  Generate a PAT
                </Button>
                <span className="mx-1">
                  on GitHub then paste your{' '}
                  <span className="italic">token</span> below.
                </span>
              </div>
              <div className="mt-1 italic">
                The required scopes will be automatically selected for you.
              </div>
            </div>
          }
        />

        <FieldInput
          name="token"
          label="Token"
          placeholder="The 40 characters token generated on GitHub"
        />

        {!isValidToken && (
          <div className="mt-4 text-sm font-medium text-red-500">
            This token could not be validated with {values.hostname}.
          </div>
        )}

        <div className="flex items-end justify-between mt-2">
          <Button
            label="GitHub Docs"
            icon={{ icon: BookIcon, size: Size.XSMALL }}
            url={Constants.GITHUB_DOCS.PAT_URL}
            size="xs"
          >
            Docs
          </Button>
          <Button
            label="Login"
            className="px-4 py-2 !text-sm"
            icon={{ icon: SignInIcon, size: Size.MEDIUM }}
            disabled={submitting || pristine}
            type="submit"
          >
            Login
          </Button>
        </div>
      </form>
    );
  };

  const login = useCallback(
    async (data: IValues) => {
      setIsValidToken(true);
      try {
        await loginWithPersonalAccessToken(
          data as LoginPersonalAccessTokenOptions,
        );
        navigate(-1);
      } catch (err) {
        logError(
          'loginWithPersonalAccessToken',
          'Failed to login with PAT',
          err,
        );
        setIsValidToken(false);
      }
    },
    [loginWithPersonalAccessToken],
  );

  return (
    <>
      <Header icon={KeyIcon}>Login with Personal Access Token</Header>

      <div className="px-8">
        <Form
          initialValues={{
            hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
            token: '' as Token,
          }}
          onSubmit={login}
          validate={validate}
        >
          {renderForm}
        </Form>
      </div>
    </>
  );
};
