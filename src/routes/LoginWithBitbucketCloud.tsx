import { BookIcon, KeyIcon, SignInIcon } from '@primer/octicons-react';
import log from 'electron-log';
import { type FC, useCallback, useContext, useState } from 'react';
import { Form, type FormRenderProps } from 'react-final-form';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Button } from '../components/buttons/Button';
import { FieldInput } from '../components/fields/FieldInput';
import { AppContext } from '../context/App';
import { Size, type Token, type Username, type Workspace } from '../types';
import type { LoginBitbucketCloudOptions } from '../utils/auth/types';
import { isValidAppPassword } from '../utils/auth/utils';
import { Constants } from '../utils/constants';

interface IValues {
  username: Username;
  token?: Token;
  workspace?: Workspace;
}

interface IFormErrors {
  username?: string;
  token?: string;
  workspace?: string;
}

export const validate = (values: IValues): IFormErrors => {
  const errors: IFormErrors = {};

  if (!values.username) {
    errors.token = 'Required';
  }

  if (!values.token) {
    errors.token = 'Required';
  } else if (!isValidAppPassword(values.token)) {
    errors.token = 'Invalid app password.';
  }

  if (!values.workspace) {
    errors.workspace = 'Required';
  }

  return errors;
};

export const LoginWithBitbucketCloud: FC = () => {
  const { loginWithBitbucketCloud } = useContext(AppContext);
  const navigate = useNavigate();
  const [isValidToken, setIsValidToken] = useState<boolean>(true);

  const renderForm = (formProps: FormRenderProps) => {
    const { handleSubmit, submitting, pristine, values } = formProps;

    return (
      <form onSubmit={handleSubmit}>
        <FieldInput
          name="username"
          label="Username"
          placeholder="Your Bitbucket Cloud username"
        />

        <FieldInput
          name="token"
          label="App Password"
          placeholder="The 36 characters app password generated on Bitbucket Cloud"
        />

        <FieldInput
          name="workspace"
          label="Workspace"
          placeholder="Your Bitbucket Cloud workspace name"
        />

        {!isValidToken && (
          <div className="mt-4 text-sm font-medium text-red-500">
            This token could not be validated with {values.workspace}.
          </div>
        )}

        <div className="flex items-end justify-between mt-2">
          <Button
            label="Bitbucket Cloud Docs"
            icon={{ icon: BookIcon, size: Size.XSMALL }}
            url={Constants.ATLASSIAN_DOCS.BITBUCKET_APP_PASSWORD_URL}
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
        await loginWithBitbucketCloud(data as LoginBitbucketCloudOptions);
        navigate(-1);
      } catch (err) {
        log.error('Auth: failed to login with personal access token', err);
        setIsValidToken(false);
      }
    },
    [loginWithBitbucketCloud],
  );

  return (
    <>
      <Header icon={KeyIcon}>Login with Bitbucket Cloud</Header>

      <div className="px-8">
        <Form
          initialValues={{
            username: '' as Username,
            token: '' as Token,
            workspace: '' as Workspace,
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
