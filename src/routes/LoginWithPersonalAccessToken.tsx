import {
  ArrowLeftIcon,
  BookIcon,
  KeyIcon,
  SignInIcon,
} from '@primer/octicons-react';

import { type FC, useCallback, useContext, useState } from 'react';
import { Form, type FormRenderProps } from 'react-final-form';
import { useNavigate } from 'react-router-dom';

import { FieldInput } from '../components/fields/FieldInput';
import { AppContext } from '../context/App';
import type { AuthTokenOptions } from '../types';
import { Constants } from '../utils/constants';

import { Button } from '../components/fields/Button';
import { getNewTokenURL } from '../utils/auth';

interface IValues {
  token?: string;
  hostname?: string;
}

interface IFormErrors {
  token?: string;
  hostname?: string;
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

  if (!values.token) {
    errors.token = 'Required';
  } else if (!/^[A-Z0-9_]{40}$/i.test(values.token)) {
    errors.token = 'Invalid token.';
  }

  return errors;
};

export const LoginWithPersonalAccessToken: FC = () => {
  const { validateToken } = useContext(AppContext);
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
            <div className="italic mt-1">
              Change only if you are using GitHub Enterprise Server.
            </div>
          }
        />

        <FieldInput
          name="token"
          label="Token"
          placeholder="The 40 characters token generated on GitHub"
          helpText={
            <div>
              <div>
                <Button
                  name="Generate a PAT"
                  label="Generate a PAT"
                  disabled={!values.hostname}
                  icon={KeyIcon}
                  size={12}
                  url={getNewTokenURL(values.hostname)}
                />{' '}
                on GitHub and paste above.
              </div>
              <div className="italic mt-1">
                The required scopes will be selected for you.
              </div>
            </div>
          }
        />

        {!isValidToken && (
          <div className="mt-4 text-red-500 text-sm font-medium">
            This token could not be validated with {values.hostname}.
          </div>
        )}

        <div className="flex justify-between items-end">
          <Button
            name="Docs"
            label="GitHub Docs"
            class="mt-2"
            icon={BookIcon}
            size={12}
            url={Constants.GITHUB_DOCS.PAT_URL}
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
    setIsValidToken(true);
    try {
      await validateToken(data as AuthTokenOptions);
      navigate(-1);
    } catch (err) {
      setIsValidToken(false);
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
          <KeyIcon size={18} className="mr-2" />
          Login with Personal Access Token
        </h3>
      </div>

      <div className="flex-1 px-8">
        <Form
          initialValues={{
            hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
            token: '',
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
