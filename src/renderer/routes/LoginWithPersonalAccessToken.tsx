import { type FC, useCallback, useContext, useState } from 'react';
import { Form, type FormRenderProps } from 'react-final-form';
import { useNavigate } from 'react-router-dom';

import { BookIcon, KeyIcon, SignInIcon } from '@primer/octicons-react';
import { Button, Stack, Text, Tooltip } from '@primer/react';

import { logError } from '../../shared/logger';
import { FieldInput } from '../components/fields/FieldInput';
import { Page } from '../components/layout/Page';
import { Header } from '../components/primitives/Header';
import { AppContext } from '../context/App';
import type { Hostname, Token } from '../types';
import type { LoginPersonalAccessTokenOptions } from '../utils/auth/types';
import {
  getNewTokenURL,
  isValidHostname,
  isValidToken,
} from '../utils/auth/utils';
import { openExternalLink } from '../utils/comms';
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
      <Page id="Login With Personal Access Token" type="h-full">
        <form onSubmit={handleSubmit}>
          <FieldInput
            name="hostname"
            label="Hostname"
            placeholder="github.company.com"
            helpText={
              <Stack direction="vertical" gap="condensed">
                <Text as="i">
                  Change only if you are using GitHub Enterprise Server.
                </Text>
                <Stack direction="horizontal" align="center" gap="condensed">
                  <Button
                    size="small"
                    leadingVisual={KeyIcon}
                    disabled={!values.hostname}
                    onClick={() =>
                      openExternalLink(getNewTokenURL(values.hostname))
                    }
                    data-testid="login-create-token"
                  >
                    Generate a PAT
                  </Button>
                  <Text>on GitHub then paste your token below.</Text>
                </Stack>
                <Text as="i">
                  The required scopes will be automatically selected for you.
                </Text>
              </Stack>
            }
          />
          <FieldInput
            name="token"
            label="Token"
            placeholder="The 40 characters token generated on GitHub"
          />
          {!isValidToken && (
            <div className="my-4 text-sm font-medium text-gitify-error">
              This token could not be validated with {values.hostname}.
            </div>
          )}
          <Stack direction="horizontal" justify="space-between" align="center">
            <Tooltip text="GitHub documentation">
              <Button
                size="small"
                leadingVisual={BookIcon}
                onClick={() => openExternalLink(Constants.GITHUB_DOCS.PAT_URL)}
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
