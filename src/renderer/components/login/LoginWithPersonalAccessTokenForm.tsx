import { type FC, type ReactNode, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { BookIcon, EyeClosedIcon, EyeIcon, KeyIcon, SignInIcon } from '@primer/octicons-react';
import { Banner, Button, FormControl, Stack, Text, TextInput, Tooltip } from '@primer/react';

import { useLogins } from '../../hooks/useLogins';

import { Contents } from '../layout/Contents';
import { Page } from '../layout/Page';
import { Footer } from '../primitives/Footer';
import { Header } from '../primitives/Header';

import type { Account, Forge, Hostname, Token } from '../../types';

import { isValidHostname } from '../../utils/auth/utils';
import { rendererLogError, toError } from '../../utils/core/logger';
import { getAdapter } from '../../utils/forges/registry';
import { openExternalLink } from '../../utils/system/comms';

interface LocationState {
  account?: Account;
}

export interface IFormData {
  token: Token;
  hostname: Hostname;
  username?: string;
}

interface IFormErrors {
  token?: string;
  hostname?: string;
  username?: string;
  invalidCredentialsForHost?: string;
}

export const validateForm = (values: IFormData, forge: Forge = 'github'): IFormErrors => {
  const errors: IFormErrors = {};
  const adapter = getAdapter(forge);

  if (!values.hostname) {
    errors.hostname = 'Hostname is required';
  } else if (!isValidHostname(values.hostname)) {
    errors.hostname = 'Hostname format is invalid';
  }

  if (forge === 'bitbucket' && !values.username) {
    errors.username = 'Atlassian email is required';
  }

  if (!values.token) {
    errors.token = 'Token is required';
  } else if (!adapter.validateToken(values.token)) {
    errors.token = 'Token format is invalid';
  }

  return errors;
};

export interface LoginWithPersonalAccessTokenFormProps {
  forge: Forge;
  /** Page header title. */
  title: string;
  /**
   * When false the hostname field is hidden and the value from
   * `adapter.defaultHostname` is used silently (e.g. Bitbucket, which is
   * always bitbucket.org).
   */
  showHostnameField?: boolean;
  /** Caption below the hostname label. Only used when showHostnameField is true. */
  hostnameCaption?: string;
  hostnamePlaceholder?: string;
  /** Label for the button that opens the forge's token settings page. */
  tokenSettingsLabel: string;
  /** Text rendered beside the token settings button. */
  tokenSettingsCaption: string;
  tokenPlaceholder: string;
  /** Tooltip for the documentation button. */
  docsTooltip: string;
  /** When true, renders an email/username field above the token input (for Bitbucket). */
  showUsernameField?: boolean;
  usernamePlaceholder?: string;
  usernameCaption?: string;
  /** Forge-specific content rendered below the token settings row (e.g. scope hints). */
  children?: ReactNode;
}

/**
 * Shared personal-access-token login form.
 *
 * Forge-specific route components (`routes/github`, `routes/gitea`) supply
 * their own copy via props so this form stays free of forge conditionals.
 */
export const LoginWithPersonalAccessTokenForm: FC<LoginWithPersonalAccessTokenFormProps> = ({
  forge,
  title,
  hostnameCaption = '',
  hostnamePlaceholder = '',
  tokenSettingsLabel,
  tokenSettingsCaption,
  tokenPlaceholder,
  docsTooltip,
  showHostnameField = true,
  showUsernameField = false,
  usernamePlaceholder = '',
  usernameCaption = '',
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { account: reAuthAccount } = (location.state ?? {}) as LocationState;

  const adapter = getAdapter(forge);

  const { loginWithPersonalAccessToken } = useLogins();

  const [shouldMaskPersonalAccessToken, setShouldMaskPersonalAccessToken] = useState(true);
  const [isVerifyingCredentials, setIsVerifyingCredentials] = useState(false);

  const [formData, setFormData] = useState({
    hostname: reAuthAccount?.hostname ?? adapter.defaultHostname ?? ('' as Hostname),
    token: '' as Token,
    username: reAuthAccount?.username ?? '',
  } as IFormData);

  const [errors, setErrors] = useState({} as IFormErrors);

  const handleSubmit = async () => {
    setIsVerifyingCredentials(true);
    const newErrors = validateForm(formData, forge);

    setErrors(newErrors);

    if (!newErrors.hostname && !newErrors.token && !newErrors.username) {
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
          ...(data.username ? { username: data.username } : {}),
          forge,
        });
        navigate('/');
      } catch (err) {
        rendererLogError('loginWithPersonalAccessToken', 'Failed to login with PAT', toError(err));
        setErrors({
          invalidCredentialsForHost: `Failed to validate provided token against ${data.hostname}`,
        });
      }
    },
    [loginWithPersonalAccessToken, forge, navigate],
  );

  return (
    <Page testId="Login With Personal Access Token">
      <Header icon={KeyIcon}>{title}</Header>

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
          {showUsernameField && (
            <FormControl required>
              <FormControl.Label>Atlassian Email</FormControl.Label>
              {usernameCaption && (
                <FormControl.Caption>
                  <Text as="i">{usernameCaption}</Text>
                </FormControl.Caption>
              )}
              <TextInput
                aria-invalid={errors.username ? 'true' : 'false'}
                block
                data-testid="login-username"
                name="username"
                onChange={handleInputChange}
                placeholder={usernamePlaceholder}
                type="email"
                value={formData.username ?? ''}
              />
              {errors.username && (
                <FormControl.Validation variant="error">{errors.username}</FormControl.Validation>
              )}
            </FormControl>
          )}

          {showHostnameField && (
            <FormControl required>
              <FormControl.Label>Hostname</FormControl.Label>
              <FormControl.Caption>
                <Text as="i">{hostnameCaption}</Text>
              </FormControl.Caption>
              <TextInput
                aria-invalid={errors.hostname ? 'true' : 'false'}
                block
                data-testid="login-hostname"
                name="hostname"
                onChange={handleInputChange}
                placeholder={hostnamePlaceholder}
                value={formData.hostname}
              />
              {errors.hostname && (
                <FormControl.Validation variant="error">{errors.hostname}</FormControl.Validation>
              )}
            </FormControl>
          )}

          <Stack direction="vertical" gap="condensed">
            <Stack align="center" direction="horizontal" gap="condensed">
              <Button
                data-testid="login-create-token"
                disabled={!formData.hostname}
                leadingVisual={KeyIcon}
                onClick={() =>
                  openExternalLink(adapter.getPersonalAccessTokenSettingsUrl(formData.hostname))
                }
                size="small"
              >
                {tokenSettingsLabel}
              </Button>
              <Text className="text-xs">{tokenSettingsCaption}</Text>
            </Stack>

            {children}
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
              placeholder={tokenPlaceholder}
              trailingAction={
                <TextInput.Action
                  aria-label={shouldMaskPersonalAccessToken ? 'Show token' : 'Hide token'}
                  icon={shouldMaskPersonalAccessToken ? EyeIcon : EyeClosedIcon}
                  onClick={() => setShouldMaskPersonalAccessToken(!shouldMaskPersonalAccessToken)}
                />
              }
              type={shouldMaskPersonalAccessToken ? 'password' : 'text'}
              value={formData.token}
            />
            {errors.token && (
              <FormControl.Validation variant="error">{errors.token}</FormControl.Validation>
            )}
          </FormControl>
        </Stack>
      </Contents>

      <Footer justify="space-between">
        <Tooltip direction="ne" text={docsTooltip}>
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
