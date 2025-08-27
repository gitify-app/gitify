import { type FC, useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  BookIcon,
  EyeClosedIcon,
  EyeIcon,
  PersonIcon,
  SignInIcon,
} from '@primer/octicons-react';
import {
  Button,
  FormControl,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@primer/react';
import { Banner } from '@primer/react/experimental';

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
import { rendererLogError } from '../utils/logger';

interface IFormData {
  hostname?: Hostname;
  clientId?: ClientID;
  clientSecret?: ClientSecret;
}

interface IFormErrors {
  hostname?: string;
  clientId?: string;
  clientSecret?: string;
  invalidCredentialsForHost?: string;
}

export const validateForm = (values: IFormData): IFormErrors => {
  const errors: IFormErrors = {};

  if (!values.hostname) {
    errors.hostname = 'Hostname is required';
  } else if (!isValidHostname(values.hostname)) {
    errors.hostname = 'Hostname format is invalid';
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

  const [maskToken, setMaskToken] = useState(true);
  const [isVerifyingCredentials, setIsVerifyingCredentials] = useState(false);

  const [formData, setFormData] = useState({
    hostname: 'github.com' as Hostname,
    clientId: '' as ClientID,
    clientSecret: '' as ClientSecret,
  } as IFormData);

  const [errors, setErrors] = useState({} as IFormErrors);

  const hasErrors = useMemo(() => {
    return Object.values(errors).some((error) => error !== '');
  }, [errors]);

  const handleSubmit = async () => {
    setIsVerifyingCredentials(true);

    const newErrors = validateForm(formData);

    setErrors(newErrors);

    if (!newErrors.hostname && !newErrors.clientId && !newErrors.clientSecret) {
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
        await loginWithOAuthApp(data as LoginOAuthAppOptions);
        navigate(-1);
      } catch (err) {
        rendererLogError(
          'loginWithOAuthApp',
          'Failed to login with OAuth App',
          err,
        );
        setErrors({
          invalidCredentialsForHost: `Failed to validate provided Client ID and Secret against ${data.hostname}`,
        });
      }
    },
    [loginWithOAuthApp],
  );

  return (
    <Page id="Login With OAuth App">
      <Header icon={PersonIcon}>Login with OAuth App</Header>

      <Contents>
        {hasErrors && (
          <Banner
            data-testid="login-errors"
            description={
              <Text color="danger.fg">
                <Stack direction="vertical" gap="condensed">
                  {errors.hostname && <Text>{errors.hostname}</Text>}
                  {errors.clientId && <Text>{errors.clientId}</Text>}
                  {errors.clientSecret && <Text>{errors.clientSecret}</Text>}
                  {errors.invalidCredentialsForHost && (
                    <Text>{errors.invalidCredentialsForHost}</Text>
                  )}
                </Stack>
              </Text>
            }
            hideTitle
            title="Validation errors"
            variant="critical"
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
              aria-invalid={errors.hostname ? 'true' : 'false'}
              block
              data-testid="login-hostname"
              name="hostname"
              onChange={handleInputChange}
              placeholder="github.com"
              sx={{
                borderColor: errors.hostname
                  ? 'danger.emphasis'
                  : 'border.default',
              }}
              value={formData.hostname}
            />
          </FormControl>
          <Stack align="center" direction="horizontal" gap="condensed">
            <Button
              data-testid="login-create-oauth-app"
              disabled={!formData.hostname}
              leadingVisual={PersonIcon}
              onClick={() =>
                openExternalLink(getNewOAuthAppURL(formData.hostname))
              }
              size="small"
            >
              Create new OAuth App
            </Button>
            <Text className="text-xs">
              and use your <Text as="i">client id & secret</Text> below.
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
              placeholder="Your generated client id (20 characters)"
              sx={{
                borderColor: errors.clientId
                  ? 'danger.emphasis'
                  : 'border.default',
              }}
              value={formData.clientId}
            />
          </FormControl>
          <FormControl required>
            <FormControl.Label>Client Secret</FormControl.Label>
            <TextInput
              aria-invalid={errors.clientSecret ? 'true' : 'false'}
              block
              data-testid="login-clientSecret"
              name="clientSecret"
              onChange={handleInputChange}
              placeholder="Your generated client secret (40 characters)"
              sx={{
                borderColor: errors.clientSecret
                  ? 'danger.emphasis'
                  : 'border.default',
              }}
              trailingAction={
                <TextInput.Action
                  aria-label={maskToken ? 'Show token' : 'Hide token'}
                  icon={maskToken ? EyeIcon : EyeClosedIcon}
                  onClick={() => setMaskToken(!maskToken)}
                />
              }
              type={maskToken ? 'password' : 'text'}
              value={formData.clientSecret}
            />
          </FormControl>
        </Stack>
      </Contents>

      <Footer justify="space-between">
        <Tooltip text="GitHub documentation">
          <Button
            data-testid="login-docs"
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
};
