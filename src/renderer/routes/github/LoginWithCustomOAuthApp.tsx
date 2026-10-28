import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { BookIcon, PersonIcon } from '@primer/octicons-react';
import { Button, FormControl, Stack, Text, TextInput, Tooltip } from '@primer/react';

import { Constants } from '../../constants';

import { Contents } from '../../components/layout/Contents';
import { Page } from '../../components/layout/Page';
import { Footer } from '../../components/primitives/Footer';
import { Header } from '../../components/primitives/Header';

import type { Account, ClientID, Forge, Hostname } from '../../types';

import {
  type CustomOAuthAppFormData,
  type CustomOAuthAppFormErrors,
  validateCustomOAuthAppForm,
} from '../../utils/auth/loginValidation';
import { getAdapter } from '../../utils/forges/registry';
import { openExternalLink } from '../../utils/system/comms';
import { GitHubDeviceFlowAuthorize } from './DeviceFlowAuthorize';

interface LocationState {
  account?: Account;
}

/**
 * Sign in with a user-supplied GitHub OAuth app.
 *
 * Collects the app's hostname and client ID (a public identifier — never a
 * secret), then hands off to the shared device-flow authorization UI.
 */
export function GitHubLoginWithCustomOAuthAppRoute() {
  const location = useLocation();
  const { account: reAuthAccount } = (location.state ?? {}) as LocationState;

  const forge: Forge = 'github';

  const [formData, setFormData] = useState<CustomOAuthAppFormData>({
    hostname: (reAuthAccount?.hostname ?? Constants.GITHUB_HOSTNAME) as Hostname,
    clientId: (reAuthAccount?.clientId ?? '') as ClientID,
  });
  const [errors, setErrors] = useState<CustomOAuthAppFormErrors>({});
  const [credentials, setCredentials] = useState<CustomOAuthAppFormData | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const newErrors = validateCustomOAuthAppForm(formData, forge);

    setErrors(newErrors);

    if (!newErrors.hostname && !newErrors.clientId) {
      setCredentials(formData);
    }
  };

  if (credentials) {
    return (
      <GitHubDeviceFlowAuthorize
        clientId={credentials.clientId}
        hostname={credentials.hostname}
        title="Authorize with your OAuth app"
      />
    );
  }

  return (
    <Page testId="Login With Custom OAuth App">
      <Header icon={PersonIcon}>Login with Custom OAuth App</Header>

      <Contents scrollFade>
        <Stack direction="vertical" gap="normal">
          <Text as="p" size="small">
            Authorize Gitify with your own GitHub OAuth app. Create an app, enable its device flow,
            then paste its client ID below.
          </Text>

          <FormControl required>
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
              data-testid="login-create-oauth-app"
              disabled={!formData.hostname}
              leadingVisual={PersonIcon}
              onClick={() => {
                const url = getAdapter(forge).customOAuthApp?.getNewOAuthAppUrl(formData.hostname);
                if (url) {
                  openExternalLink(url);
                }
              }}
              size="small"
            >
              Create new OAuth app
            </Button>
            <Text className="text-xs">
              and enable its <Text as="i">device flow</Text>, then use its client ID below.
            </Text>
          </Stack>

          <FormControl required>
            <FormControl.Label>Client ID</FormControl.Label>
            <TextInput
              aria-invalid={errors.clientId ? 'true' : 'false'}
              block
              data-testid="login-clientId"
              name="clientId"
              onChange={handleInputChange}
              placeholder="Your generated client ID (20 characters)"
              value={formData.clientId}
            />
            {errors.clientId && (
              <FormControl.Validation variant="error">{errors.clientId}</FormControl.Validation>
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

        <Button data-testid="login-submit" onClick={handleSubmit} variant="primary">
          Continue
        </Button>
      </Footer>
    </Page>
  );
}
