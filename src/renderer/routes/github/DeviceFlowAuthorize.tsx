import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  CheckCircleFillIcon,
  CopyIcon,
  GlobeIcon,
  LinkIcon,
  SignInIcon,
  SyncIcon,
} from '@primer/octicons-react';
import { Banner, Button, Heading, IconButton, Stack, Text } from '@primer/react';

import { Constants } from '../../constants';

import { useLogins } from '../../hooks/useLogins';

import { Contents } from '../../components/layout/Contents';
import { Page } from '../../components/layout/Page';
import { Footer } from '../../components/primitives/Footer';
import { Header } from '../../components/primitives/Header';

import type { Account, ClientID, Forge, Hostname, Link } from '../../types';
import type { DeviceFlowSession } from '../../utils/auth/types';

import i18n from '../../i18n';
import { getAlternateScopeNames, getRecommendedScopeNames } from '../../utils/auth/scopeNames';
import { rendererLogError, toError } from '../../utils/core/logger';
import { getAdapter } from '../../utils/forges/registry';
import { copyToClipboard, openExternalLink } from '../../utils/system/comms';

interface LocationState {
  account?: Account;
}

interface GitHubDeviceFlowAuthorizeProps {
  /** OAuth app client ID to authorize; omit to use Gitify's preconfigured app. */
  clientId?: ClientID;
  /** Hostname to authenticate against; defaults to the re-auth account or GitHub.com. */
  hostname?: Hostname;
  /** Page heading; defaults to authorizing Gitify's preconfigured app. */
  title?: string;
}

type ScopeChoice = 'public' | 'full';

export function GitHubDeviceFlowAuthorize({
  clientId,
  hostname,
  title,
}: Readonly<GitHubDeviceFlowAuthorizeProps>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { account: reAuthAccount } = (location.state ?? {}) as LocationState;

  const forge: Forge = 'github';

  const resolvedHostname = (hostname ??
    reAuthAccount?.hostname ??
    Constants.GITHUB_HOSTNAME) as Hostname;

  const { loginWithDeviceFlowStart, loginWithDeviceFlowPoll, loginWithDeviceFlowComplete } =
    useLogins();

  const [session, setSession] = useState<DeviceFlowSession | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scopeChoice, setScopeChoice] = useState<ScopeChoice | null>(null);

  // Initialize device flow session, copy code, and open browser
  useEffect(() => {
    const initializeDeviceFlow = async () => {
      try {
        const scopes =
          scopeChoice === 'public' ? getAlternateScopeNames() : getRecommendedScopeNames();

        const newSession = await loginWithDeviceFlowStart(
          forge,
          resolvedHostname,
          scopes,
          clientId,
        );
        setSession(newSession);

        // Auto-copy the user code to clipboard
        await copyToClipboard(newSession.userCode);

        // Auto-open the verification URL in the browser
        openExternalLink(newSession.verificationUri as Link);
      } catch (err) {
        rendererLogError('LoginWithDeviceFlow', 'Failed to start device flow', toError(err));
        setError(
          getAdapter(forge).deviceFlow?.describeStartError?.(err, resolvedHostname, clientId) ??
            i18n.t(
              'login.device.start_failed',
              'Failed to start authentication. Please try again.',
            ),
        );
      }
    };

    if (scopeChoice) {
      void initializeDeviceFlow();
    }
  }, [loginWithDeviceFlowStart, resolvedHostname, clientId, scopeChoice, forge]);

  // Poll for device flow completion
  useEffect(() => {
    if (!session) {
      return;
    }

    let isActive = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const startPolling = async () => {
      setIsPolling(true);

      const poll = async (): Promise<void> => {
        if (!isActive || Date.now() >= session.expiresAt) {
          if (isActive) {
            setError(
              i18n.t('login.device.code_expired', 'Device code expired. Please start again.'),
            );
          }
          return;
        }

        const token = await loginWithDeviceFlowPoll(forge, session);

        if (token && isActive) {
          await loginWithDeviceFlowComplete(forge, token, session.hostname, clientId);
          void navigate('/');
          return;
        }

        const intervalMs = Math.max(5000, session.intervalSeconds * 1000);
        await new Promise((resolve) => {
          timeoutId = setTimeout(resolve, intervalMs);
        });
        await poll();
      };

      try {
        await poll();
      } catch (err) {
        if (isActive) {
          rendererLogError('LoginWithDeviceFlow', 'Failed to poll device flow', toError(err));
          setError(i18n.t('login.device.auth_failed', 'Authentication failed. Please try again.'));
        }
      } finally {
        if (isActive) {
          setIsPolling(false);
        }
      }
    };

    void startPolling();

    return () => {
      isActive = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    // oxlint-disable-next-line react/exhaustive-deps -- navigate is stable
  }, [session, loginWithDeviceFlowPoll, loginWithDeviceFlowComplete, clientId, forge]);

  const handleCopyUserCode = useCallback(async () => {
    if (session?.userCode) {
      await copyToClipboard(session.userCode);
    }
  }, [session?.userCode]);

  const handleOpenBrowser = useCallback(() => {
    if (session?.verificationUri) {
      openExternalLink(session.verificationUri as Link);
    }
  }, [session?.verificationUri]);

  const handleCopyVerificationLink = useCallback(async () => {
    if (session?.verificationUri) {
      await copyToClipboard(session.verificationUri);
    }
  }, [session?.verificationUri]);

  // Render UI states as separate functions for clarity
  const renderSessionUI = () => {
    if (!session) {
      return null;
    }

    return (
      <Stack direction="vertical" gap="normal">
        <Heading as="h3">
          <Trans
            i18nKey="login.device.authorize"
            components={[<Text as="span" key={0} />]}
            defaults="Authorize the app <0>using this code.</0>"
          />
        </Heading>

        <Stack align="center" direction="horizontal" gap="condensed">
          <Text
            as="div"
            data-testid="device-user-code"
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              letterSpacing: '0.05em',
            }}
          >
            {session.userCode}
          </Text>
          <IconButton
            aria-label={t('login.device.copy_code', 'Copy device code')}
            icon={CopyIcon}
            onClick={handleCopyUserCode}
            size="small"
            variant="invisible"
          />
        </Stack>

        <Stack direction="vertical" gap="condensed">
          <Stack align="center" direction="horizontal" gap="condensed">
            <CheckCircleFillIcon size={16} />
            <Text size="small">{t('login.device.code_copied', 'Code copied to clipboard')}</Text>
          </Stack>

          <Stack align="center" direction="horizontal" gap="condensed">
            <GlobeIcon size={16} />
            <Text size="small">
              {t('login.device.opened', 'Opened {{hostname}}', {
                hostname:
                  session.hostname === Constants.GITHUB_HOSTNAME ? 'GitHub.com' : session.hostname,
              })}
            </Text>
          </Stack>

          <Stack align="center" direction="horizontal" gap="condensed">
            <SyncIcon className={isPolling ? 'animate-spin' : 'opacity-30'} size={16} />
            <Text size="small">{t('login.device.waiting', 'Waiting for authorization...')}</Text>
          </Stack>
        </Stack>
      </Stack>
    );
  };

  const renderScopeChoiceUI = () => (
    <Stack direction="vertical" gap="normal">
      <Text as="p">
        {t('login.device.receive_notifications_for', 'Receive notifications for:')}
      </Text>

      <Stack align="center" direction="vertical">
        <Button
          block
          data-testid="device-scope-full"
          labelWrap
          onClick={() => setScopeChoice('full')}
          variant="primary"
        >
          <Stack gap="none">
            <Text as="strong">{t('login.device.scope_full_title', 'Public and Private')}</Text>
            <Text size="small">
              {t(
                'login.device.scope_full_description',
                'Best experience, but requires broader permissions.',
              )}
            </Text>
            <Text as="em" size="small">
              {t('login.device.scopes', 'Scopes: {{scopes}}', {
                scopes: getRecommendedScopeNames().join(', '),
              })}
            </Text>
          </Stack>
        </Button>

        <Button block labelWrap onClick={() => setScopeChoice('public')}>
          <Stack gap="none">
            <Text>{t('login.device.scope_public_title', 'Public')}</Text>
            <Text size="small">
              {t(
                'login.device.scope_public_description',
                'Limited experience with least privilege permissions.',
              )}
            </Text>
            <Text as="em" size="small">
              {t('login.device.scopes', 'Scopes: {{scopes}}', {
                scopes: getAlternateScopeNames().join(', '),
              })}
            </Text>
          </Stack>
        </Button>

        {(() => {
          const adapter = getAdapter(forge);
          const revokeUrl = adapter.deviceFlow?.getRevokeAccessUrl(resolvedHostname, clientId);
          if (!revokeUrl) {
            return null;
          }
          const label = t(
            'login.device.developer_settings_link',
            '{{forge}} → Developer Settings',
            {
              forge: adapter.displayName,
            },
          );
          const revokeLink = (
            <button
              className="text-gitify-link cursor-pointer"
              key={0}
              onClick={() => openExternalLink(revokeUrl)}
              title={label}
              type="button"
            />
          );
          return (
            <Stack gap="none">
              <Text as="em" size="small">
                {clientId ? (
                  <Trans
                    components={[revokeLink]}
                    defaults="Note: to change previously granted permissions, revoke your app's access at <0>{{label}}</0>, then re-authorize above."
                    i18nKey="login.device.revoke_note_custom"
                    values={{ label }}
                  />
                ) : (
                  <Trans
                    components={[revokeLink]}
                    defaults="Note: to change previously granted permissions, revoke Gitify's access at <0>{{label}}</0>, then re-authorize above."
                    i18nKey="login.device.revoke_note"
                    values={{ label }}
                  />
                )}
              </Text>
            </Stack>
          );
        })()}
      </Stack>
    </Stack>
  );

  const renderInitializingUI = () => (
    <Stack align="center" direction="vertical" gap="normal">
      <IconButton
        aria-label={t('login.device.initializing', 'Initializing')}
        className={'animate-spin'}
        icon={SyncIcon}
        size="large"
        variant="invisible"
      />
      <Text>{t('login.device.initializing_authentication', 'Initializing authentication...')}</Text>
    </Stack>
  );

  let mainContent: ReactNode;
  if (session) {
    mainContent = renderSessionUI();
  } else if (!scopeChoice) {
    mainContent = renderScopeChoiceUI();
  } else {
    mainContent = renderInitializingUI();
  }

  return (
    <Page testId="Login With Device Flow">
      <Header icon={SignInIcon}>
        {title ?? t('login.device.title', "Authorize Gitify's OAuth App")}
      </Header>

      <Contents scrollFade>
        {error && (
          <Banner
            data-testid="login-errors"
            description={
              <Text color="danger.fg">
                <Stack direction="vertical" gap="condensed">
                  <Text>{error}</Text>
                </Stack>
              </Text>
            }
            hideTitle
            title={t('login.device.login_errors', 'Login errors')}
            variant="critical"
          />
        )}
        {mainContent}
      </Contents>

      {session ? (
        <Footer justify="space-between">
          <Button leadingVisual={GlobeIcon} onClick={handleOpenBrowser} variant="primary">
            {t('login.device.open', 'Open {{hostname}}', {
              hostname:
                session.hostname === Constants.GITHUB_HOSTNAME ? 'GitHub.com' : session.hostname,
            })}
          </Button>
          <Stack direction="horizontal" gap="condensed">
            <Button leadingVisual={LinkIcon} onClick={handleCopyVerificationLink} variant="default">
              {t('login.device.copy_link', 'Copy link')}
            </Button>
            <Button data-testid="cancel-button" onClick={() => navigate(-1)} variant="default">
              {t('common.cancel', 'Cancel')}
            </Button>
          </Stack>
        </Footer>
      ) : (
        <Footer justify="end">
          <Button data-testid="cancel-button" onClick={() => navigate(-1)} variant="default">
            {t('common.cancel', 'Cancel')}
          </Button>
        </Footer>
      )}
    </Page>
  );
}
