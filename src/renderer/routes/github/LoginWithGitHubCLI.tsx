import { type FC, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { SignInIcon, TerminalIcon } from '@primer/octicons-react';
import { Banner, Button, FormControl, Stack, Text, TextInput } from '@primer/react';

import { Constants } from '../../constants';

import { useLogins } from '../../hooks/useLogins';

import { Contents } from '../../components/layout/Contents';
import { Page } from '../../components/layout/Page';
import { summarizeLoginError } from '../../components/login/LoginWithPersonalAccessTokenForm';
import { Footer } from '../../components/primitives/Footer';
import { Header } from '../../components/primitives/Header';

import type { Account, Hostname } from '../../types';

import { isValidHostname } from '../../utils/auth/utils';
import { rendererLogError, toError } from '../../utils/core/logger';

interface LocationState {
  account?: Account;
}

export const GitHubLoginWithCLIRoute: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { account: reAuthAccount } = (location.state ?? {}) as LocationState;

  const { loginWithCli } = useLogins();

  const [hostname, setHostname] = useState<Hostname>(
    reAuthAccount?.hostname ?? Constants.GITHUB_HOSTNAME,
  );
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!hostname || !isValidHostname(hostname)) {
      setError('Hostname format is invalid');
      return;
    }

    setError(null);
    setIsLoggingIn(true);

    try {
      await loginWithCli('github', hostname);
      navigate('/');
    } catch (err) {
      rendererLogError('loginWithCli', 'Failed to login with GitHub CLI', toError(err));
      setError(summarizeLoginError(err) ?? `Failed to login with GitHub CLI against ${hostname}`);
    } finally {
      setIsLoggingIn(false);
    }
  }, [hostname, loginWithCli, navigate]);

  return (
    <Page testId="Login With GitHub CLI">
      <Header icon={TerminalIcon}>Login with GitHub CLI</Header>

      <Contents scrollFade>
        {error && (
          <Banner
            data-testid="login-errors"
            description={<Text color="danger.fg">{error}</Text>}
            hideTitle
            title="Form errors"
            variant="critical"
          />
        )}

        <Stack direction="vertical" gap="normal">
          <Text className="text-xs">
            Uses the token your local <Text as="i">gh</Text> install already holds, so no token has
            to be created or pasted. Gitify reads it from the CLI on every refresh, which means{' '}
            <Text as="i">gh auth login</Text> and <Text as="i">gh auth refresh</Text> keep working
            without re-authenticating here.
          </Text>

          <Text className="text-xs">
            The scopes come from the GitHub CLI and cannot be changed from Gitify. Its{' '}
            <Text as="i">repo</Text> scope covers notification access; run{' '}
            <Text as="i">gh auth refresh -s notifications</Text> to grant that scope explicitly.
          </Text>

          <FormControl required>
            <FormControl.Label>Hostname</FormControl.Label>
            <FormControl.Caption>
              <Text as="i">Change only if you are using GitHub Enterprise Server</Text>
            </FormControl.Caption>
            <TextInput
              aria-invalid={error ? 'true' : 'false'}
              block
              data-testid="login-hostname"
              name="hostname"
              onChange={(e) => setHostname(e.target.value as Hostname)}
              value={hostname}
            />
          </FormControl>
        </Stack>
      </Contents>

      <Footer justify="end">
        <Button
          data-testid="login-submit"
          leadingVisual={SignInIcon}
          loading={isLoggingIn}
          onClick={handleSubmit}
          variant="primary"
        >
          Login
        </Button>
      </Footer>
    </Page>
  );
};
