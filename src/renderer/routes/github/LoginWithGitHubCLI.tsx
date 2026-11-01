import { useCallback, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { SignInIcon, TerminalIcon } from '@primer/octicons-react';
import { Banner, Button, FormControl, Stack, Text, TextInput } from '@primer/react';

import { Constants } from '../../constants';

import { useAppNavigate } from '../../hooks/useAppNavigate';
import { useLogins } from '../../hooks/useLogins';

import { Contents } from '../../components/layout/Contents';
import { Page } from '../../components/layout/Page';
import { Footer } from '../../components/primitives/Footer';
import { Header } from '../../components/primitives/Header';

import type { Account, Hostname } from '../../types';

import i18n from '../../i18n';
import { summarizeLoginError } from '../../utils/auth/loginValidation';
import { isValidHostname } from '../../utils/auth/utils';
import { rendererLogError, toError } from '../../utils/core/logger';

interface LocationState {
  account?: Account;
}

export function GitHubLoginWithCLIRoute() {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
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
      setError(i18n.t('login.cli.hostname_invalid', 'Hostname format is invalid'));
      return;
    }

    setError(null);
    setIsLoggingIn(true);

    try {
      await loginWithCli('github', hostname);
      navigate('/');
    } catch (err) {
      rendererLogError('loginWithCli', 'Failed to login with GitHub CLI', toError(err));
      setError(
        summarizeLoginError(err) ??
          i18n.t('login.cli.login_failed', 'Failed to login with GitHub CLI against {{hostname}}', {
            hostname,
          }),
      );
    } finally {
      setIsLoggingIn(false);
    }
  }, [hostname, loginWithCli, navigate]);

  return (
    <Page testId="Login With GitHub CLI">
      <Header icon={TerminalIcon}>{t('login.cli.title', 'Login with GitHub CLI')}</Header>

      <Contents scrollFade>
        {error && (
          <Banner
            data-testid="login-errors"
            description={<Text color="danger.fg">{error}</Text>}
            hideTitle
            title={t('login.cli.form_errors', 'Form errors')}
            variant="critical"
          />
        )}

        <Stack direction="vertical" gap="normal">
          <Text className="text-xs">
            <Trans
              i18nKey="login.cli.intro_token"
              components={[
                <Text as="i" key={0} />,
                <Text as="i" key={1} />,
                <Text as="i" key={2} />,
              ]}
              defaults="Uses the token your local <0>gh</0> install already holds, so no token has to be created or pasted. Gitify reads it from the CLI on every refresh, which means <1>gh auth login</1> and <2>gh auth refresh</2> keep working without re-authenticating here."
            />
          </Text>

          <Text className="text-xs">
            <Trans
              i18nKey="login.cli.intro_scopes"
              components={[
                <Text as="i" key={0} />,
                <Text as="i" key={1} />,
                <Text as="i" key={2} />,
              ]}
              defaults="The scopes come from the GitHub CLI and cannot be changed from Gitify. Its <0>repo</0> scope covers notification access; run <1>gh auth refresh -s notifications</1> to grant that scope explicitly."
            />
          </Text>

          <FormControl required>
            <FormControl.Label>{t('login.cli.hostname', 'Hostname')}</FormControl.Label>
            <FormControl.Caption>
              <Text as="i">
                {t(
                  'login.cli.hostname_caption',
                  'Change only if you are using GitHub Enterprise Server',
                )}
              </Text>
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
          {t('common.login', 'Login')}
        </Button>
      </Footer>
    </Page>
  );
}
