import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { BookIcon, EyeClosedIcon, EyeIcon, PersonIcon, SignInIcon } from '@primer/octicons-react';
import { Banner, Button, FormControl, Stack, Text, TextInput, Tooltip } from '@primer/react';

import { Constants } from '../../constants';

import { useLogins } from '../../hooks/useLogins';

import { Contents } from '../../components/layout/Contents';
import { Page } from '../../components/layout/Page';
import { Footer } from '../../components/primitives/Footer';
import { Header } from '../../components/primitives/Header';

import type { Account, ClientID, ClientSecret, Forge } from '../../types';

import {
  type OAuthAppFormData,
  type OAuthAppFormErrors,
  validateOAuthAppForm,
} from '../../utils/auth/loginValidation';
import { rendererLogError, toError } from '../../utils/core/logger';
import { getAdapter } from '../../utils/forges/registry';
import { openExternalLink } from '../../utils/system/comms';

interface LocationState {
  account?: Account;
}

export function GitHubLoginWithOAuthAppRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { account: reAuthAccount } = (location.state ?? {}) as LocationState;

  const forge: Forge = 'github';

  const { loginWithOAuthApp } = useLogins();

  const [shouldMaskClientSecret, setShouldMaskClientSecret] = useState(true);
  const [isVerifyingCredentials, setIsVerifyingCredentials] = useState(false);

  const [formData, setFormData] = useState({
    hostname: reAuthAccount?.hostname ?? Constants.GITHUB_HOSTNAME,
    clientId: '' as ClientID,
    clientSecret: '' as ClientSecret,
  } as OAuthAppFormData);

  const [errors, setErrors] = useState({} as OAuthAppFormErrors);

  const handleSubmit = async () => {
    setIsVerifyingCredentials(true);

    const newErrors = validateOAuthAppForm(formData, forge);

    setErrors(newErrors);

    if (!newErrors.hostname && !newErrors.clientId && !newErrors.clientSecret) {
      await verifyLoginCredentials(formData);
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
    async (data: OAuthAppFormData) => {
      try {
        await loginWithOAuthApp(forge, data);
        void navigate('/');
      } catch (err) {
        rendererLogError('loginWithOAuthApp', 'Failed to login with OAuth App', toError(err));
        setErrors({
          invalidCredentialsForHost: `Failed to validate provided Client ID and Secret against ${data.hostname}`,
        });
      }
    },
    // oxlint-disable-next-line react/exhaustive-deps -- navigate is stable
    [loginWithOAuthApp, forge],
  );

  return (
    <Page testId="Login With OAuth App">
      <Header icon={PersonIcon}>Login with OAuth App</Header>

      <Contents scrollFade>
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
            title="Validation errors"
            variant="critical"
          />
        )}
        <Stack direction="vertical" gap="normal">
          <FormControl id="login-hostname" required>
            <FormControl.Label>Hostname</FormControl.Label>
            <FormControl.Caption>
              <Text as="i">Change only if you are using GitHub Enterprise Server</Text>
            </FormControl.Caption>
            <TextInput
              aria-invalid={errors.hostname ? 'true' : 'false'}
              block
              className={
                errors.hostname
                  ? 'border-gitify-textInput-error'
                  : 'border-gitify-textInput-default'
              }
              data-testid="login-hostname"
              name="hostname"
              onChange={handleInputChange}
              placeholder="github.com"
              value={formData.hostname}
            />
            {errors.hostname && (
              <FormControl.Validation variant="error">{errors.hostname}</FormControl.Validation>
            )}
          </FormControl>
          <Stack align="center" direction="horizontal" gap="condensed">
            <Button
              disabled={!formData.hostname}
              leadingVisual={PersonIcon}
              onClick={() => {
                const url = getAdapter(forge).oauthWebApp?.getNewOAuthAppUrl(formData.hostname);
                if (url) {
                  openExternalLink(url);
                }
              }}
              size="small"
            >
              Create new OAuth App
            </Button>
            <Text className="text-xs">
              and use your <Text as="i">client id & secret</Text> below.
            </Text>
          </Stack>
          <FormControl id="login-clientId" required>
            <FormControl.Label>Client ID</FormControl.Label>
            <TextInput
              aria-invalid={errors.clientId ? 'true' : 'false'}
              block
              name="clientId"
              onChange={handleInputChange}
              placeholder="Your generated client id (20 characters)"
              value={formData.clientId}
            />
            {errors.clientId && (
              <FormControl.Validation variant="error">{errors.clientId}</FormControl.Validation>
            )}
          </FormControl>
          <FormControl id="login-clientSecret" required>
            <FormControl.Label>Client Secret</FormControl.Label>
            <TextInput
              aria-invalid={errors.clientSecret ? 'true' : 'false'}
              block
              name="clientSecret"
              onChange={handleInputChange}
              placeholder="Your generated client secret (40 characters)"
              trailingAction={
                <TextInput.Action
                  aria-label={shouldMaskClientSecret ? 'Show token' : 'Hide token'}
                  icon={shouldMaskClientSecret ? EyeIcon : EyeClosedIcon}
                  onClick={() => setShouldMaskClientSecret(!shouldMaskClientSecret)}
                />
              }
              type={shouldMaskClientSecret ? 'password' : 'text'}
              value={formData.clientSecret}
            />
            {errors.clientSecret && (
              <FormControl.Validation variant="error">{errors.clientSecret}</FormControl.Validation>
            )}
          </FormControl>
        </Stack>
      </Contents>

      <Footer justify="space-between">
        <Tooltip text="GitHub documentation">
          <Button
            leadingVisual={BookIcon}
            onClick={() => openExternalLink(Constants.GITHUB_DOCS.OAUTH_URL)}
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
}
