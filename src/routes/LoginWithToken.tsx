import React, { useCallback, useContext, useState } from 'react';
import { Form, FormRenderProps } from 'react-final-form';
import { ArrowLeftIcon } from '@primer/octicons-react';
import { useHistory } from 'react-router-dom';
import { shell } from 'electron';

import { AppContext } from '../context/App';
import { AuthTokenOptions } from '../types';
import { Constants } from '../utils/constants';
import { FieldInput } from '../components/fields/FieldInput';

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
  if (!values.token) {
    errors.token = 'Required';
  } else if (!/^[A-Z0-9_]{40}$/i.test(values.token)) {
    errors.token = 'Invalid token.';
  }

  if (!values.hostname) {
    errors.hostname = 'Required';
  } else if (
    !/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/i.test(
      values.hostname
    )
  ) {
    errors.hostname = 'Invalid hostname.';
  }

  return errors;
};

export const LoginWithToken: React.FC = () => {
  const { validateToken } = useContext(AppContext);
  const history = useHistory();
  const [isValidToken, setIsValidToken] = useState<boolean>(true);

  const openLink = useCallback((url: string) => {
    shell.openExternal(url);
  }, []);

  const renderForm = (formProps: FormRenderProps) => {
    const { handleSubmit, submitting, pristine, values } = formProps;

    return (
      <form onSubmit={handleSubmit}>
        <FieldInput
          name="token"
          label="Token"
          placeholder="The 40 characters token generated on GitHub"
          helpText={
            <>
              To generate a token, go to GitHub,{' '}
              <a
                className="underline hover:text-gray-500 dark:hover:text-gray-300  cursor-pointer"
                onClick={() => openLink('https://github.com/settings/tokens')}
              >
                personal access tokens
              </a>{' '}
              and create one with the{' '}
              <span className="underline font-extrabold text-yellow-500">
                {Constants.AUTH_SCOPE.join(', ')}{' '}
              </span>
              scopes.
            </>
          }
        />

        <FieldInput
          name="hostname"
          label="Hostname"
          placeholder="github.company.com"
          helpText="Defaults to github.com. Change only if you are using GitHub for Enterprise."
        />

        {!isValidToken && (
          <div className="mt-4 text-red-500 text-sm font-medium">
            This token could not be validated with {values.hostname}.
          </div>
        )}

        <button
          className="float-right px-4 py-2 my-4 bg-gray-300 font-semibold rounded text-sm text-center hover:bg-gray-500 hover:text-white dark:text-black focus:outline-none"
          disabled={submitting || pristine}
          type="submit"
          title="Submit Button"
        >
          Submit
        </button>
      </form>
    );
  };

  const submit = useCallback(async (data: IValues) => {
    setIsValidToken(true);
    try {
      await validateToken(data as AuthTokenOptions);
      history.goBack();
    } catch (err) {
      setIsValidToken(false);
    }
  }, []);

  return (
    <div className="flex-1 bg-white dark:bg-gray-dark dark:text-white">
      <div className="flex justify-between items-center mt-4 py-2 mx-8">
        <button
          className="focus:outline-none"
          aria-label="Go Back"
          onClick={() => history.goBack()}
        >
          <ArrowLeftIcon size={20} className="hover:text-gray-400" />
        </button>

        <h3 className="text-lg font-semibold">Login with an access token</h3>
      </div>

      <div className="flex-1 px-8">
        <Form
          initialValues={{
            token: '',
            hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
          }}
          onSubmit={submit}
          validate={validate}
        >
          {renderForm}
        </Form>
      </div>
    </div>
  );
};
