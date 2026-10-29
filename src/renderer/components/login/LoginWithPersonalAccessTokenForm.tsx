import { type ReactNode, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { BookIcon, EyeClosedIcon, EyeIcon, KeyIcon, SignInIcon } from '@primer/octicons-react';
import { Banner, Button, FormControl, Stack, Text, TextInput, Tooltip } from '@primer/react';

import { useLogins } from '../../hooks/useLogins';

import { Contents } from '../layout/Contents';
import { Page } from '../layout/Page';
import { Footer } from '../primitives/Footer';
import { Header } from '../primitives/Header';

import type { Account, Forge, Hostname, Token } from '../../types';

import i18n from '../../i18n';
import {
  type PersonalAccessTokenFormData,
  type PersonalAccessTokenFormErrors,
  summarizeLoginError,
  validatePersonalAccessTokenForm,
} from '../../utils/auth/loginValidation';
import { rendererLogError, toError } from '../../utils/core/logger';
import { getAdapter } from '../../utils/forges/registry';
import { openExternalLink } from '../../utils/system/comms';

interface LocationState {
  account?: Account;
}

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
  tokenSettingsCaption?: string;
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
 * Forge-specific route components under `routes/` supply their own copy via
 * props so this form stays free of forge conditionals.
 */
export function LoginWithPersonalAccessTokenForm({
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
}: Readonly<LoginWithPersonalAccessTokenFormProps>) {
  const { t } = useTranslation();
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
  } as PersonalAccessTokenFormData);

  const [errors, setErrors] = useState({} as PersonalAccessTokenFormErrors);

  const handleSubmit = async () => {
    setIsVerifyingCredentials(true);
    const newErrors = validatePersonalAccessTokenForm(formData, forge);

    setErrors(newErrors);

    if (!newErrors.hostname && !newErrors.token && !newErrors.username) {
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
    async (data: PersonalAccessTokenFormData) => {
      try {
        await loginWithPersonalAccessToken({
          hostname: data.hostname,
          token: data.token,
          ...(data.username ? { username: data.username } : {}),
          forge,
        });
        void navigate('/');
      } catch (err) {
        rendererLogError('loginWithPersonalAccessToken', 'Failed to login with PAT', toError(err));
        setErrors({
          invalidCredentialsForHost: i18n.t(
            'login.pat.invalid_token',
            'Failed to validate provided token against {{hostname}}',
            { hostname: data.hostname },
          ),
          invalidCredentialsDetail: summarizeLoginError(err),
        });
      }
    },
    [loginWithPersonalAccessToken, forge, navigate],
  );

  return (
    <Page testId="Login With Personal Access Token">
      <Header icon={KeyIcon}>{title}</Header>

      <Contents scrollFade>
        {errors.invalidCredentialsForHost && (
          <Banner
            data-testid="login-errors"
            description={
              <Text color="danger.fg">
                <Stack direction="vertical" gap="condensed">
                  <Text>{errors.invalidCredentialsForHost}</Text>
                  {errors.invalidCredentialsDetail && (
                    <Text>{errors.invalidCredentialsDetail}</Text>
                  )}
                </Stack>
              </Text>
            }
            hideTitle
            title={t('login.pat.form_errors', 'Form errors')}
            variant="critical"
          />
        )}
        <Stack direction="vertical" gap="normal">
          {showUsernameField && (
            <FormControl id="login-username" required>
              <FormControl.Label>
                {t('login.pat.atlassian_email', 'Atlassian Email')}
              </FormControl.Label>
              {usernameCaption && (
                <FormControl.Caption>
                  <Text as="i">{usernameCaption}</Text>
                </FormControl.Caption>
              )}
              <TextInput
                aria-invalid={errors.username ? 'true' : 'false'}
                block
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
            <FormControl id="login-hostname" required>
              <FormControl.Label>{t('login.pat.hostname', 'Hostname')}</FormControl.Label>
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
                disabled={!adapter.validateHostname(formData.hostname)}
                leadingVisual={KeyIcon}
                onClick={() =>
                  openExternalLink(adapter.getPersonalAccessTokenSettingsUrl(formData.hostname))
                }
                size="small"
              >
                {tokenSettingsLabel}
              </Button>
              {tokenSettingsCaption && <Text className="text-xs">{tokenSettingsCaption}</Text>}
            </Stack>

            {children}
          </Stack>

          <FormControl id="login-token" required>
            <FormControl.Label>{t('login.pat.token', 'Token')}</FormControl.Label>
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
                  aria-label={
                    shouldMaskPersonalAccessToken
                      ? t('login.show_token', 'Show token')
                      : t('login.hide_token', 'Hide token')
                  }
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
            leadingVisual={BookIcon}
            onClick={() => openExternalLink(adapter.documentationUrl)}
            size="small"
          >
            {t('common.docs', 'Docs')}
          </Button>
        </Tooltip>

        <Button
          data-testid="login-submit"
          leadingVisual={SignInIcon}
          loading={isVerifyingCredentials}
          onClick={handleSubmit}
          variant="primary"
        >
          {t('common.login', 'Login')}
        </Button>
      </Footer>
    </Page>
  );
}
