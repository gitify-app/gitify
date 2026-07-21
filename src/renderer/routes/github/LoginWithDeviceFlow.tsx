import { type FC, type ReactNode, useCallback, useEffect, useState } from 'react';
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

import type { Account, Forge, Hostname, Link } from '../../types';
import type { DeviceFlowSession } from '../../utils/auth/types';

import { getAlternateScopeNames, getRecommendedScopeNames } from '../../utils/auth/scopes';
import { rendererLogError, toError } from '../../utils/core/logger';
import { getAdapter } from '../../utils/forges/registry';
import { copyToClipboard, openExternalLink } from '../../utils/system/comms';

interface LocationState {
  account?: Account;
}

type ScopeChoice = 'public' | 'full';

export const GitHubLoginWithDeviceFlowRoute: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { account: reAuthAccount } = (location.state ?? {}) as LocationState;

  const forge: Forge = 'github';

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

        const newSession = await loginWithDeviceFlowStart(forge, reAuthAccount?.hostname, scopes);
        setSession(newSession);

        // Auto-copy the user code to clipboard
        await copyToClipboard(newSession.userCode);

        // Auto-open the verification URL in the browser
        openExternalLink(newSession.verificationUri as Link);
      } catch (err) {
        rendererLogError('LoginWithDeviceFlow', 'Failed to start device flow', toError(err));
        setError('Failed to start authentication. Please try again.');
      }
    };

    if (scopeChoice) {
      initializeDeviceFlow();
    }
  }, [loginWithDeviceFlowStart, reAuthAccount, scopeChoice, forge]);

  // Poll for device flow completion
  useEffect(() => {
    if (!session) {
      return;
    }

    let isActive = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const startPolling = async () => {
      setIsPolling(true);

      try {
        while (isActive && Date.now() < session.expiresAt) {
          const token = await loginWithDeviceFlowPoll(forge, session);

          if (token && isActive) {
            await loginWithDeviceFlowComplete(forge, token, session.hostname);
            navigate('/');
            return;
          }

          const intervalMs = Math.max(5000, session.intervalSeconds * 1000);
          await new Promise((resolve) => {
            timeoutId = setTimeout(resolve, intervalMs);
          });
        }

        if (isActive) {
          setError('Device code expired. Please start again.');
        }
      } catch (err) {
        if (isActive) {
          rendererLogError('LoginWithDeviceFlow', 'Failed to poll device flow', toError(err));
          setError('Authentication failed. Please try again.');
        }
      } finally {
        if (isActive) {
          setIsPolling(false);
        }
      }
    };

    startPolling();

    return () => {
      isActive = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    // oxlint-disable-next-line react/exhaustive-deps -- navigate is stable
  }, [session, loginWithDeviceFlowPoll, loginWithDeviceFlowComplete, forge]);

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
          Authorize the app <Text as="span">using this code.</Text>
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
            aria-label="Copy device code"
            data-testid="copy-device-code"
            icon={CopyIcon}
            onClick={handleCopyUserCode}
            size="small"
            variant="invisible"
          />
        </Stack>

        <Stack direction="vertical" gap="condensed">
          <Stack align="center" direction="horizontal" gap="condensed">
            <CheckCircleFillIcon size={16} />
            <Text size="small">Code copied to clipboard</Text>
          </Stack>

          <Stack align="center" direction="horizontal" gap="condensed">
            <GlobeIcon size={16} />
            <Text size="small">
              Opened{' '}
              {session.hostname === Constants.GITHUB_HOSTNAME ? 'GitHub.com' : session.hostname}
            </Text>
          </Stack>

          <Stack align="center" direction="horizontal" gap="condensed">
            <SyncIcon className={isPolling ? 'animate-spin' : 'opacity-30'} size={16} />
            <Text size="small">Waiting for authorization...</Text>
          </Stack>
        </Stack>
      </Stack>
    );
  };

  const renderScopeChoiceUI = () => (
    <Stack direction="vertical" gap="normal">
      <Text as="p">Receive notifications for:</Text>

      <Stack align="center" direction="vertical">
        <Button
          block
          data-testid="device-scope-full"
          labelWrap
          onClick={() => setScopeChoice('full')}
          variant="primary"
        >
          <Stack gap="none">
            <Text as="strong">Public and Private</Text>
            <Text size="small">Best experience, but requires broader permissions.</Text>
            <Text as="em" size="small">
              Scopes: {getRecommendedScopeNames().join(', ')}
            </Text>
          </Stack>
        </Button>

        <Button
          block
          data-testid="device-scope-public"
          labelWrap
          onClick={() => setScopeChoice('public')}
        >
          <Stack gap="none">
            <Text>Public</Text>
            <Text size="small">Limited experience with least privilege permissions.</Text>
            <Text as="em" size="small">
              Scopes: {getAlternateScopeNames().join(', ')}
            </Text>
          </Stack>
        </Button>

        {(() => {
          const adapter = getAdapter(forge);
          const revokeUrl = adapter.deviceFlow?.getRevokeAccessUrl(
            (reAuthAccount?.hostname ?? Constants.GITHUB_HOSTNAME) as Hostname,
          );
          if (!revokeUrl) {
            return null;
          }
          const label = `${adapter.displayName} → Developer Settings`;
          return (
            <Stack gap="none">
              <Text as="em" size="small">
                Note: to change previously granted permissions, revoke Gitify's access at{' '}
                <button
                  className="text-gitify-link cursor-pointer"
                  onClick={() => openExternalLink(revokeUrl)}
                  title={label}
                  type="button"
                >
                  {label}
                </button>
                , then re-authorize above.
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
        aria-label="Initializing"
        className={'animate-spin'}
        icon={SyncIcon}
        size="large"
        variant="invisible"
      />
      <Text>Initializing authentication...</Text>
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
      <Header icon={SignInIcon}>Authorize with GitHub</Header>

      <Contents>
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
            title="Login errors"
            variant="critical"
          />
        )}
        {mainContent}
      </Contents>

      {session ? (
        <Footer justify="space-between">
          <Button
            data-testid="open-browser-button"
            leadingVisual={GlobeIcon}
            onClick={handleOpenBrowser}
            variant="primary"
          >
            Open {session.hostname === Constants.GITHUB_HOSTNAME ? 'GitHub.com' : session.hostname}
          </Button>
          <Stack direction="horizontal" gap="condensed">
            <Button
              data-testid="copy-link-button"
              leadingVisual={LinkIcon}
              onClick={handleCopyVerificationLink}
              variant="default"
            >
              Copy link
            </Button>
            <Button data-testid="cancel-button" onClick={() => navigate(-1)} variant="default">
              Cancel
            </Button>
          </Stack>
        </Footer>
      ) : (
        <Footer justify="end">
          <Button data-testid="cancel-button" onClick={() => navigate(-1)} variant="default">
            Cancel
          </Button>
        </Footer>
      )}
    </Page>
  );
};
