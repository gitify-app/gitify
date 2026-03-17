import { type FC, useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { CopyIcon, SignInIcon, SyncIcon } from '@primer/octicons-react';
import {
  Banner,
  Button,
  IconButton,
  Link as PrimerLink,
  Stack,
  Text,
} from '@primer/react';

import { useAppContext } from '../hooks/useAppContext';

import { Contents } from '../components/layout/Contents';
import { Page } from '../components/layout/Page';
import { Footer } from '../components/primitives/Footer';
import { Header } from '../components/primitives/Header';

import type { Account, Link } from '../types';
import type { DeviceFlowSession } from '../utils/auth/types';

import {
  getAlternateScopeNames,
  getRecommendedScopeNames,
} from '../utils/auth/utils';
import { rendererLogError } from '../utils/core/logger';
import { copyToClipboard, openExternalLink } from '../utils/system/comms';

interface LocationState {
  account?: Account;
}

type ScopeChoice = 'public' | 'full';

export const LoginWithDeviceFlowRoute: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { account: reAuthAccount } = (location.state ?? {}) as LocationState;

  const {
    loginWithDeviceFlowStart,
    loginWithDeviceFlowPoll,
    loginWithDeviceFlowComplete,
  } = useAppContext();

  const [session, setSession] = useState<DeviceFlowSession | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scopeChoice, setScopeChoice] = useState<ScopeChoice | null>(null);

  // Initialize device flow session, copy code, and open browser
  useEffect(() => {
    const initializeDeviceFlow = async () => {
      try {
        const scopes =
          scopeChoice === 'public'
            ? getAlternateScopeNames()
            : getRecommendedScopeNames();

        const newSession = await loginWithDeviceFlowStart(
          reAuthAccount?.hostname,
          scopes,
        );
        setSession(newSession);

        // Auto-copy the user code to clipboard
        await copyToClipboard(newSession.userCode);

        // Auto-open the verification URL in the browser
        openExternalLink(newSession.verificationUri as Link);
      } catch (err) {
        rendererLogError(
          'LoginWithDeviceFlow',
          'Failed to start device flow',
          err,
        );
        setError('Failed to start authentication. Please try again.');
      }
    };

    if (scopeChoice) {
      initializeDeviceFlow();
    }
  }, [loginWithDeviceFlowStart, reAuthAccount, scopeChoice]);

  // Poll for device flow completion
  useEffect(() => {
    if (!session) {
      return;
    }

    let isActive = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const startPolling = async () => {
      setIsPolling(true);
      const intervalMs = Math.max(5000, session.intervalSeconds * 1000);

      try {
        while (isActive && Date.now() < session.expiresAt) {
          const token = await loginWithDeviceFlowPoll(session);

          if (token && isActive) {
            await loginWithDeviceFlowComplete(token, session.hostname);
            navigate('/');
            return;
          }

          await new Promise((resolve) => {
            timeoutId = setTimeout(resolve, intervalMs);
          });
        }

        if (isActive) {
          setError('Device code expired. Please start again.');
        }
      } catch (err) {
        if (isActive) {
          rendererLogError(
            'LoginWithDeviceFlow',
            'Failed to poll device flow',
            err,
          );
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
  }, [session, loginWithDeviceFlowPoll, loginWithDeviceFlowComplete]);

  const handleCopyUserCode = useCallback(async () => {
    if (session?.userCode) {
      await copyToClipboard(session.userCode);
    }
  }, [session?.userCode]);

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

        {/** GitHub Device Code Flow session */}
        {session ? (
          <Stack direction="vertical" gap="normal">
            <Stack direction="vertical" gap="condensed">
              <Text as="p">
                Go to{' '}
                <PrimerLink
                  data-testid="device-verification-link"
                  href={session.verificationUri}
                >
                  <code>{session.verificationUri}</code>
                </PrimerLink>
              </Text>
              <Text as="p">and enter your device code when prompted:</Text>
            </Stack>

            <Stack
              align="center"
              direction="horizontal"
              justify="space-between"
              padding="condensed"
            >
              <Text
                as="div"
                data-testid="device-user-code"
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
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
                variant="default"
              />
            </Stack>

            <Text as="p" size="small">
              We're waiting for authorization...
            </Text>
            {isPolling && (
              <Stack align="center" gap="normal">
                <IconButton
                  aria-label="Polling"
                  className="animate-spin"
                  icon={SyncIcon}
                  size="small"
                  variant="invisible"
                />
                <Text as="em" size="small">
                  Polling for authorization
                </Text>
              </Stack>
            )}
          </Stack>
        ) : !scopeChoice ? (
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
                  <Text size="small">
                    Best experience, but requires broader permissions.
                  </Text>
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
                  <Text size="small">
                    Limited experience with least privilege permissions.
                  </Text>
                  <Text as="em" size="small">
                    Scopes: {getAlternateScopeNames().join(', ')}
                  </Text>
                </Stack>
              </Button>
            </Stack>
          </Stack>
        ) : (
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
        )}
      </Contents>

      <Footer justify="space-between">
        <Button
          data-testid="cancel-button"
          onClick={() => navigate(-1)}
          variant="default"
        >
          Cancel
        </Button>
      </Footer>
    </Page>
  );
};
