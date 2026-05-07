import { type FC, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  BookIcon,
  EyeClosedIcon,
  EyeIcon,
  KeyIcon,
  SignInIcon,
} from '@primer/octicons-react';
import {
  Banner,
  Button,
  FormControl,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@primer/react';

import { useAppContext } from '../hooks/useAppContext';

import { Contents } from '../components/layout/Contents';
import { Page } from '../components/layout/Page';
import { Footer } from '../components/primitives/Footer';
import { Header } from '../components/primitives/Header';

import type { Account, Forge, Hostname, Token } from '../types';
import type { LoginRouteState } from '../utils/forges/types';

import { formatRecommendedOAuthScopes } from '../utils/auth/scopes';
import { isValidHostname } from '../utils/auth/utils';
import { rendererLogError, toError } from '../utils/core/logger';
import { getAdapter } from '../utils/forges/registry';
import { openExternalLink } from '../utils/system/comms';

interface LocationState extends LoginRouteState {
  account?: Account;
}

export interface IFormData {
  token: Token;
  hostname: Hostname;
}

interface IFormErrors {
  token?: string;
  hostname?: string;
  invalidCredentialsForHost?: string;
}

export const validateForm = (
  values: IFormData,
  forge: Forge = 'github',
): IFormErrors => {
  const errors: IFormErrors = {};
  const adapter = getAdapter(forge);

  if (!values.hostname) {
    errors.hostname = 'Hostname is required';
  } else if (!isValidHostname(values.hostname)) {
    errors.hostname = 'Hostname format is invalid';
  }

  if (!values.token) {
    errors.token = 'Token is required';
  } else if (!adapter.validateToken(values.token)) {
    errors.token = 'Token format is invalid';
  }

  return errors;
};

export const LoginWithPersonalAccessTokenRoute: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { account: reAuthAccount, forge: stateForge } = (location.state ??
    {}) as LocationState;

  const forge: Forge = reAuthAccount?.forge ?? stateForge ?? 'github';
  const adapter = getAdapter(forge);
  const isGitea = forge === 'gitea';

  const { loginWithPersonalAccessToken } = useAppContext();

  const [shouldMaskPersonalAccessToken, setShouldMaskPersonalAccessToken] =
    useState(true);
  const [isVerifyingCredentials, setIsVerifyingCredentials] = useState(false);

  const [formData, setFormData] = useState({
    hostname:
      reAuthAccount?.hostname ?? adapter.defaultHostname ?? ('' as Hostname),
    token: '' as Token,
  } as IFormData);

  const [errors, setErrors] = useState({} as IFormErrors);

  const handleSubmit = async () => {
    setIsVerifyingCredentials(true);
    const newErrors = validateForm(formData, forge);

    setErrors(newErrors);

    if (!newErrors.hostname && !newErrors.token) {
      verifyLoginCredentials(formData);
    }
    setIsVerifyingCredentials(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const verifyLoginCredentials = useCallback(
    async (data: IFormData) => {
      try {
        await loginWithPersonalAccessToken({
          hostname: data.hostname,
          token: data.token,
          forge,
        });
        navigate('/');
      } catch (err) {
        rendererLogError(
          'loginWithPersonalAccessToken',
          'Failed to login with PAT',
          toError(err),
        );
        setErrors({
          invalidCredentialsForHost: `Failed to validate provided token against ${data.hostname}`,
        });
      }
    },
    [loginWithPersonalAccessToken, forge, navigate],
  );

  return (
    <Page testId="Login With Personal Access Token">
      <Header icon={KeyIcon}>
        {isGitea
          ? 'Login to Gitea with Personal Access Token'
          : 'Login with Personal Access Token'}
      </Header>

      <Contents>
        {errors.invalidCredentialsForHost && (
          <Banner
            data-testid="login-errors"
            description={
              <Text color="danger.fg">
                <Stack direction="vertical" gap="condensed">
                  <Text>{errors.invalidCredentialsForHost}</Text>
                </Stack>
              </Text>
            }
            hideTitle
            title="Form errors"
            variant="critical"
          />
        )}
        <Stack direction="vertical" gap="normal">
          <FormControl required>
            <FormControl.Label>Hostname</FormControl.Label>
            <FormControl.Caption>
              <Text as="i">
                {isGitea
                  ? 'Your Gitea instance hostname (for example gitea.example.com)'
                  : 'Change only if you are using GitHub Enterprise Server'}
              </Text>
            </FormControl.Caption>
            <TextInput
              aria-invalid={errors.hostname ? 'true' : 'false'}
              block
              data-testid="login-hostname"
              name="hostname"
              onChange={handleInputChange}
              placeholder={isGitea ? 'gitea.example.com' : 'github.com'}
              value={formData.hostname}
            />
            {errors.hostname && (
              <FormControl.Validation variant="error">
                {errors.hostname}
              </FormControl.Validation>
            )}
          </FormControl>

          <Stack direction="vertical" gap="condensed">
            <Stack align="center" direction="horizontal" gap="condensed">
              <Button
                data-testid="login-create-token"
                disabled={!formData.hostname}
                leadingVisual={KeyIcon}
                onClick={() =>
                  openExternalLink(
                    adapter.getPersonalAccessTokenSettingsUrl(
                      formData.hostname,
                    ),
                  )
                }
                size="small"
              >
                {isGitea ? 'Open token settings' : 'Generate a PAT'}
              </Button>
              <Text className="text-xs">
                {isGitea
                  ? 'on your Gitea instance to create a token, then paste it below.'
                  : 'on GitHub to paste the token below.'}
              </Text>
            </Stack>

            {!isGitea && (
              <Text as="i" className="text-xs">
                The{' '}
                <Tooltip direction="se" text={formatRecommendedOAuthScopes()}>
                  <button type="button">
                    <Text as="u">recommended scopes</Text>
                  </button>
                </Tooltip>{' '}
                will be automatically selected for you.
              </Text>
            )}
          </Stack>

          <FormControl required>
            <FormControl.Label>Token</FormControl.Label>
            <TextInput
              aria-invalid={errors.token ? 'true' : 'false'}
              block
              className="border-red-600"
              data-testid="login-token"
              name="token"
              onChange={handleInputChange}
              placeholder={
                isGitea
                  ? 'Your Gitea personal access token'
                  : 'Your generated token (40 characters)'
              }
              trailingAction={
                <TextInput.Action
                  aria-label={
                    shouldMaskPersonalAccessToken ? 'Show token' : 'Hide token'
                  }
                  icon={shouldMaskPersonalAccessToken ? EyeIcon : EyeClosedIcon}
                  onClick={() =>
                    setShouldMaskPersonalAccessToken(
                      !shouldMaskPersonalAccessToken,
                    )
                  }
                />
              }
              type={shouldMaskPersonalAccessToken ? 'password' : 'text'}
              value={formData.token}
            />
            {errors.token && (
              <FormControl.Validation variant="error">
                {errors.token}
              </FormControl.Validation>
            )}
          </FormControl>
        </Stack>
      </Contents>

      <Footer justify="space-between">
        <Tooltip
          direction="ne"
          text={isGitea ? 'Gitea API documentation' : 'GitHub documentation'}
        >
          <Button
            data-testid="login-docs"
            leadingVisual={BookIcon}
            onClick={() => openExternalLink(adapter.documentationUrl)}
            size="small"
          >
            Docs
          </Button>
        </Tooltip>

        <Button
          data-testid="login-submit"
          leadingVisual={SignInIcon}
          loading={isVerifyingCredentials}
          onClick={handleSubmit}
          variant="primary"
        >
          Login
        </Button>
      </Footer>
    </Page>
  );
};
