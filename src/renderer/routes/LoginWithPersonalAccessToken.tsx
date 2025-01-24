import { type FC, useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  BookIcon,
  EyeClosedIcon,
  EyeIcon,
  KeyIcon,
  SignInIcon,
} from '@primer/octicons-react';
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
import type { Hostname, Token } from '../types';
import type { LoginPersonalAccessTokenOptions } from '../utils/auth/types';
import {
  formatRequiredScopes,
  getNewTokenURL,
  isValidHostname,
  isValidToken,
} from '../utils/auth/utils';
import { openExternalLink } from '../utils/comms';
import { Constants } from '../utils/constants';

interface IFormData {
  token?: Token;
  hostname?: Hostname;
}

interface IFormErrors {
  token?: string;
  hostname?: string;
}

export const validateForm = (values: IFormData): IFormErrors => {
  const errors: IFormErrors = {};

  if (!values.hostname) {
    errors.hostname = 'Hostname is required';
  } else if (!isValidHostname(values.hostname)) {
    errors.hostname = 'Hostname format is invalid';
  }

  if (!values.token) {
    errors.token = 'Token is required';
  } else if (!isValidToken(values.token)) {
    errors.token = 'Token format is invalid (must be 40 characters long)';
  }

  return errors;
};

export const LoginWithPersonalAccessTokenRoute: FC = () => {
  const navigate = useNavigate();

  const { loginWithPersonalAccessToken } = useContext(AppContext);

  const [isValidCredentialsForHost, setIsValidCredentialsForHost] =
    useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    hostname: 'github.com' as Hostname,
    token: '' as Token,
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

    if (!newErrors.hostname && !newErrors.token) {
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
        setIsValidCredentialsForHost(false);
      }
    },
    [loginWithPersonalAccessToken],
  );

  return (
    <Page id="Login With Personal Access Token">
      <Header icon={KeyIcon}>Login with Personal Access Token</Header>

      <Box as="form" onSubmit={handleSubmit}>
        <Contents>
          {hasErrors && (
            <Banner
              title="Form errors"
              variant="critical"
              hideTitle
              description={
                <Text color="danger.fg">
                  <Stack direction="vertical" gap="condensed">
                    {errors.hostname && <Text>{errors.hostname}</Text>}
                    {errors.token && <Text>{errors.token}</Text>}
                    {!isValidCredentialsForHost && (
                      <Text>
                        Failed to validate provided token against{' '}
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

            <Stack direction="vertical" gap="condensed">
              <Stack direction="horizontal" align="center" gap="condensed">
                <Button
                  size="small"
                  leadingVisual={KeyIcon}
                  disabled={!formData.hostname}
                  onClick={() =>
                    openExternalLink(getNewTokenURL(formData.hostname))
                  }
                  data-testid="login-create-token"
                >
                  Generate a PAT
                </Button>
                <Text className="text-xs">
                  on GitHub to paste the token below.
                </Text>
              </Stack>

              <Text as="i" className="text-xs">
                The{' '}
                <Tooltip text={formatRequiredScopes()}>
                  <Text as="u">required scopes</Text>
                </Tooltip>{' '}
                will be automatically selected for you.
              </Text>
            </Stack>

            <FormControl required>
              <FormControl.Label>Token</FormControl.Label>
              <TextInput
                name="token"
                type={showPassword ? 'text' : 'password'}
                value={formData.token}
                onChange={handleInputChange}
                aria-invalid={errors.token ? 'true' : 'false'}
                placeholder="The 40 character token as generated on GitHub"
                sx={{
                  borderColor: errors.token
                    ? 'danger.emphasis'
                    : 'border.default',
                }}
                trailingAction={
                  <TextInput.Action
                    onClick={() => setShowPassword(!showPassword)}
                    icon={showPassword ? EyeClosedIcon : EyeIcon}
                    aria-label={showPassword ? 'Hide token' : 'Show token'}
                  />
                }
                block
              />
            </FormControl>
          </Stack>
        </Contents>

        <Footer justify="space-between">
          <Tooltip text="GitHub documentation" direction="ne">
            <Button
              size="small"
              leadingVisual={BookIcon}
              onClick={() => openExternalLink(Constants.GITHUB_DOCS.PAT_URL)}
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
