import { type FC, useCallback, useContext } from 'react';
import { Form, type FormRenderProps } from 'react-final-form';
import { useNavigate } from 'react-router-dom';

import { BookIcon, PersonIcon, SignInIcon } from '@primer/octicons-react';
import { Button, Stack, Text, Tooltip } from '@primer/react';

import { logError } from '../../shared/logger';
import { FieldInput } from '../components/fields/FieldInput';
import { Page } from '../components/layout/Page';
import { Header } from '../components/primitives/Header';
import { AppContext } from '../context/App';
import type { ClientID, ClientSecret, Hostname, Token } from '../types';
import type { LoginOAuthAppOptions } from '../utils/auth/types';
import {
  getNewOAuthAppURL,
  isValidClientId,
  isValidHostname,
  isValidToken,
} from '../utils/auth/utils';
import { openExternalLink } from '../utils/comms';
import { Constants } from '../utils/constants';

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

export const LoginWithOAuthAppRoute: FC = () => {
  const navigate = useNavigate();

  const { loginWithOAuthApp } = useContext(AppContext);

  const renderForm = (formProps: FormRenderProps) => {
    const { handleSubmit, submitting, pristine, values } = formProps;

    return (
      <Page id="Login With OAuth App" type="h-full">
        <form onSubmit={handleSubmit} className="-mt-5">
          <FieldInput
            name="hostname"
            label="Hostname"
            placeholder="github.company.com"
            helpText={
              <Stack direction="vertical" gap="condensed">
                <Stack direction="horizontal" align="center" gap="condensed">
                  <Button
                    size="small"
                    leadingVisual={PersonIcon}
                    disabled={!values.hostname}
                    onClick={() =>
                      openExternalLink(getNewOAuthAppURL(values.hostname))
                    }
                    data-testid="login-create-oauth-app"
                  >
                    Create new OAuth App
                  </Button>
                  <Text>on GitHub then paste your</Text>
                </Stack>
                <Text>
                  <Text as="i">client id and client secret</Text> below.
                </Text>
              </Stack>
            }
          />

          <FieldInput
            name="clientId"
            label="Client ID"
            placeholder="123456789"
          />

          <FieldInput
            name="clientSecret"
            label="Client Secret"
            placeholder="ABC123DEF456"
          />

          <Stack direction="horizontal" justify="space-between" align="center">
            <Tooltip text="GitHub documentation">
              <Button
                size="small"
                leadingVisual={BookIcon}
                onClick={() =>
                  openExternalLink(Constants.GITHUB_DOCS.OAUTH_URL)
                }
                data-testid="login-docs"
              >
                Docs
              </Button>
            </Tooltip>

            <Tooltip text="Login">
              <Button
                variant="primary"
                leadingVisual={SignInIcon}
                disabled={submitting || pristine}
                type="submit"
                data-testid="login-submit"
              >
                Login
              </Button>
            </Tooltip>
          </Stack>
        </form>
      </Page>
    );
  };

  const login = useCallback(
    async (data: IValues) => {
      try {
        await loginWithOAuthApp(data as LoginOAuthAppOptions);
        navigate(-1);
      } catch (err) {
        logError('loginWithOAuthApp', 'Failed to login with OAuth App', err);
      }
    },
    [loginWithOAuthApp],
  );

  return (
    <div>
      <Header icon={PersonIcon}>Login with OAuth App</Header>
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
