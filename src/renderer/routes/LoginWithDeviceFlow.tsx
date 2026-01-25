import { type FC, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CopyIcon, SignInIcon, SyncIcon } from '@primer/octicons-react';
import {
  Button,
  IconButton,
  Link as PrimerLink,
  Stack,
  Text,
  Tooltip,
} from '@primer/react';

import { useAppContext } from '../hooks/useAppContext';

import { Contents } from '../components/layout/Contents';
import { Page } from '../components/layout/Page';
import { Footer } from '../components/primitives/Footer';
import { Header } from '../components/primitives/Header';

import type { Link } from '../types';
import type { DeviceFlowSession } from '../utils/auth/types';

import { copyToClipboard, openExternalLink } from '../utils/comms';
import { rendererLogError } from '../utils/logger';

export const LoginWithDeviceFlowRoute: FC = () => {
  const navigate = useNavigate();

  const {
    loginWithDeviceFlowStart,
    loginWithDeviceFlowPoll,
    loginWithDeviceFlowComplete,
  } = useAppContext();

  const [session, setSession] = useState<DeviceFlowSession | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize device flow session, copy code, and open browser
  useEffect(() => {
    const initializeDeviceFlow = async () => {
      try {
        const newSession = await loginWithDeviceFlowStart();
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

    initializeDeviceFlow();
  }, [loginWithDeviceFlowStart]);

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
            navigate(-1);
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
          <div
            style={{
              backgroundColor: 'var(--color-danger-subtle)',
              borderColor: 'var(--color-danger-emphasis)',
              borderRadius: '6px',
              borderWidth: '1px',
              padding: '12px',
            }}
          >
            <Text color="danger.fg">{error}</Text>
          </div>
        )}

        {session ? (
          <Stack direction="vertical" gap="normal">
            <Stack direction="vertical" gap="condensed">
              <Text as="p">
                Go to{' '}
                <PrimerLink href={session.verificationUri}>
                  <code>{session.verificationUri}</code>
                </PrimerLink>
              </Text>
              <Text as="p">and enter your device code when prompted:</Text>
            </Stack>

            <div
              style={{
                backgroundColor: 'var(--color-canvas-subtle)',
                borderRadius: '6px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <Text
                as="div"
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                }}
              >
                {session.userCode}
              </Text>
              <Tooltip text="Copy code">
                <IconButton
                  aria-label="Copy device code"
                  icon={CopyIcon}
                  onClick={handleCopyUserCode}
                  size="small"
                  variant="default"
                />
              </Tooltip>
            </div>

            <Stack direction="vertical" gap="condensed">
              <Text
                as="p"
                style={{ fontSize: '12px', color: 'var(--color-fg-muted)' }}
              >
                We're waiting for authorization...
              </Text>
              {isPolling && (
                <Stack align="center" gap="normal">
                  <IconButton
                    aria-label="Polling"
                    className={'animate-spin'}
                    icon={SyncIcon}
                    size="small"
                    variant="invisible"
                  />
                  <Text style={{ fontSize: '12px' }}>
                    Polling for authorization
                  </Text>
                </Stack>
              )}
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
            />{' '}
            <Text>Initializing authentication...</Text>
          </Stack>
        )}
      </Contents>

      <Footer justify="space-between">
        <Button onClick={() => navigate(-1)} variant="default">
          Cancel
        </Button>

        {/* {session && (
          <Button
            disabled={!session || isPolling}
            leadingVisual={SignInIcon}
            onClick={() => {
              if (session.verificationUri) {
                window.open(session.verificationUri, '_blank');
              }
            }}
            variant="primary"
          >
            Open Browser
          </Button>
        )} */}
      </Footer>
    </Page>
  );
};
