import { type FC, useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BookIcon, PersonIcon, SignInIcon } from '@primer/octicons-react';
import {
  Box,
  Button,
  FormControl,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@primer/react';
import { Banner } from '@primer/react/experimental';

import { logError } from '../../shared/logger';
import { Contents } from '../components/layout/Contents';
import { Page } from '../components/layout/Page';
import { Footer } from '../components/primitives/Footer';
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

interface IFormData {
  hostname?: Hostname;
  clientId?: ClientID;
  clientSecret?: ClientSecret;
}

interface IFormErrors {
  hostname?: string;
  clientId?: string;
  clientSecret?: string;
}

export const validateForm = (values: IFormData): IFormErrors => {
  const errors: IFormErrors = {};

  if (!values.hostname) {
    errors.hostname = 'Hostname is required';
  } else if (!isValidHostname(values.hostname)) {
    errors.hostname = 'Hostname is invalid';
  }

  if (!values.clientId) {
    errors.clientId = 'Client ID is required';
  } else if (!isValidClientId(values.clientId)) {
    errors.clientId = 'Client ID format is invalid';
  }

  if (!values.clientSecret) {
    errors.clientSecret = 'Client Secret is required';
  } else if (!isValidToken(values.clientSecret as unknown as Token)) {
    errors.clientSecret = 'Client Secret format is invalid';
  }

  return errors;
};

export const LoginWithOAuthAppRoute: FC = () => {
  const navigate = useNavigate();

  const { loginWithOAuthApp } = useContext(AppContext);

  const [isValidCredentialsForHost, setIsValidCredentialsForHost] =
    useState(true);

  const [formData, setFormData] = useState({
    hostname: 'github.com' as Hostname,
    clientId: '' as ClientID,
    clientSecret: '' as ClientSecret,
  } as IFormData);

  const [errors, setErrors] = useState({} as IFormErrors);

  const hasErrors = useMemo(() => {
    return (
      Object.values(errors).some((error) => error !== '') ||
      !isValidCredentialsForHost
    );
  }, [errors, isValidCredentialsForHost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateForm(formData);

    setErrors(newErrors);

    if (!newErrors.hostname && !newErrors.clientId && !newErrors.clientSecret) {
      verifyLoginCredentials(formData);
    }
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
      setIsValidCredentialsForHost(true);
      try {
        await loginWithOAuthApp(data as LoginOAuthAppOptions);
        navigate(-1);
      } catch (err) {
        logError('loginWithOAuthApp', 'Failed to login with OAuth App', err);
        setIsValidCredentialsForHost(false);
      }
    },
    [loginWithOAuthApp],
  );

  return (
    <Page id="Login With OAuth App">
      <Header icon={PersonIcon}>Login with OAuth App</Header>

      <Box as="form" onSubmit={handleSubmit}>
        <Contents>
          {hasErrors && (
            <Banner
              title="Validation errors"
              variant="critical"
              hideTitle
              description={
                <Text color="danger.fg">
                  <Stack direction="vertical" gap="condensed">
                    {errors.hostname && <Text>{errors.hostname}</Text>}
                    {errors.clientId && <Text>{errors.clientId}</Text>}
                    {errors.clientSecret && <Text>{errors.clientSecret}</Text>}
                    {!isValidCredentialsForHost && (
                      <Text>
                        Failed to validate provided Client ID and Secret against{' '}
                        {formData.hostname}
                      </Text>
                    )}
                  </Stack>
                </Text>
              }
            />
          )}
          <Stack direction="vertical" gap="normal">
            <FormControl required>
              <FormControl.Label>Hostname</FormControl.Label>
              <FormControl.Caption>
                <Text as="i">
                  Change only if you are using GitHub Enterprise Server
                </Text>
              </FormControl.Caption>
              <TextInput
                name="hostname"
                value={formData.hostname}
                onChange={handleInputChange}
                aria-invalid={errors.hostname ? 'true' : 'false'}
                sx={{
                  borderColor: errors.hostname
                    ? 'danger.emphasis'
                    : 'border.default',
                }}
                block
              />
            </FormControl>
            <Stack direction="horizontal" align="center" gap="condensed">
              {/* <Stack direction="horizontal" align="center" gap="condensed"> */}
              <Button
                size="small"
                leadingVisual={PersonIcon}
                disabled={!formData.hostname}
                onClick={() =>
                  openExternalLink(getNewOAuthAppURL(formData.hostname))
                }
                data-testid="login-create-oauth-app"
              >
                Create new OAuth App
              </Button>
              <Text className="text-xs">
                and use your <Text as="i">client id/secret</Text> below.
              </Text>
              {/* </Stack> */}
            </Stack>
            <FormControl required>
              <FormControl.Label>Client ID</FormControl.Label>
              <TextInput
                name="clientId"
                value={formData.clientId}
                onChange={handleInputChange}
                aria-invalid={errors.clientId ? 'true' : 'false'}
                sx={{
                  borderColor: errors.clientId
                    ? 'danger.emphasis'
                    : 'border.default',
                }}
                block
              />
            </FormControl>
            <FormControl required>
              <FormControl.Label>Client Secret</FormControl.Label>
              <TextInput
                name="clientSecret"
                value={formData.clientSecret}
                onChange={handleInputChange}
                aria-invalid={errors.clientSecret ? 'true' : 'false'}
                sx={{
                  borderColor: errors.clientSecret
                    ? 'danger.emphasis'
                    : 'border.default',
                }}
                block
              />
            </FormControl>
          </Stack>
        </Contents>

        <Footer justify="space-between">
          <Tooltip text="GitHub documentation">
            <Button
              size="small"
              leadingVisual={BookIcon}
              onClick={() => openExternalLink(Constants.GITHUB_DOCS.OAUTH_URL)}
              data-testid="login-docs"
            >
              Docs
            </Button>
          </Tooltip>

          <Button
            variant="primary"
            leadingVisual={SignInIcon}
            type="submit"
            data-testid="login-submit"
          >
            Login
          </Button>
        </Footer>
      </Box>
    </Page>
  );
};
