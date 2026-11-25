import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { SignInIcon, TerminalIcon } from '@primer/octicons-react';
import {
  Banner,
  Button,
  FormControl,
  Select,
  Spinner,
  Stack,
  Text,
  TextInput,
} from '@primer/react';

import type { GitHubCliIdentity } from '../../../shared/events';

import { Constants } from '../../constants';

import { useLogins } from '../../hooks/useLogins';
import { useAccountsStore } from '../../stores';

import { Contents } from '../../components/layout/Contents';
import { Page } from '../../components/layout/Page';
import { Footer } from '../../components/primitives/Footer';
import { Header } from '../../components/primitives/Header';

import type { Account, Hostname } from '../../types';
import type { CliAccountChoice, CliAccountsError } from '../../utils/forges/types';

import i18n from '../../i18n';
import { summarizeLoginError } from '../../utils/auth/loginValidation';
import { getAccountUUID, isValidHostname } from '../../utils/auth/utils';
import { rendererLogError, toError } from '../../utils/core/logger';
import { getAdapter } from '../../utils/forges/registry';

interface LocationState {
  account?: Account;
}

type AccountsState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; accounts: CliAccountChoice[] }
  | { status: 'unsupported' }
  | { status: 'failed'; error: CliAccountsError };

/** How long to wait after the hostname settles before asking the CLI. */
const ACCOUNTS_DEBOUNCE_MS = 250;

const ENVIRONMENT_VALUE = 'environment';

/** Stable option value for an identity; also its cache and comparison key. */
function identityValue(identity: GitHubCliIdentity): string {
  return identity.kind === 'account' ? `account:${identity.login}` : ENVIRONMENT_VALUE;
}

function identityFromValue(value: string): GitHubCliIdentity | undefined {
  if (value === ENVIRONMENT_VALUE) {
    return { kind: 'environment' };
  }

  return value.startsWith('account:')
    ? { kind: 'account', login: value.slice('account:'.length) }
    : undefined;
}

function sameIdentity(left: GitHubCliIdentity, right: GitHubCliIdentity): boolean {
  if (left.kind !== right.kind) {
    return false;
  }

  if (left.kind === 'environment' || right.kind === 'environment') {
    return true;
  }

  return left.login.toLowerCase() === right.login.toLowerCase();
}

/**
 * Choose the identity to preselect: a still-offered pinned identity wins;
 * otherwise the only offered identity, otherwise the CLI's active one.
 * A pinned identity that is no longer offered selects nothing, so the user
 * must choose rather than silently signing in as someone else.
 */
function preferredIdentity(
  accounts: CliAccountChoice[],
  pinned: GitHubCliIdentity | undefined,
): GitHubCliIdentity | undefined {
  if (pinned) {
    return accounts.find((account) => sameIdentity(account.identity, pinned))?.identity;
  }

  if (accounts.length === 1) {
    return accounts[0].identity;
  }

  return accounts.find((account) => account.active)?.identity;
}

export function GitHubLoginWithCLIRoute() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { account: reAuthAccount } = (location.state ?? {}) as LocationState;

  const { loginWithCli } = useLogins();
  const enrolledAccounts = useAccountsStore((state) => state.accounts);

  const [hostname, setHostname] = useState<Hostname>(
    reAuthAccount?.hostname ?? Constants.GITHUB_HOSTNAME,
  );
  const [accountsResult, setAccountsResult] = useState<{
    hostname: Hostname;
    state: AccountsState;
  } | null>(null);
  const [userSelection, setUserSelection] = useState<{
    hostname: Hostname;
    identity?: GitHubCliIdentity;
  } | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pinnedIdentity = reAuthAccount?.cliIdentity;

  useEffect(() => {
    if (!hostname || !isValidHostname(hostname)) {
      return;
    }

    let cancelled = false;

    const timer = setTimeout(() => {
      void loadAccounts(hostname).then((state) => {
        if (!cancelled) {
          setAccountsResult({ hostname, state });
        }
      });
    }, ACCOUNTS_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [hostname]);

  // Derived during render so a hostname change immediately disables Login and
  // clears the old host's choice without an effect-driven state update.
  let accountsState: AccountsState = { status: 'idle' };
  if (isValidHostname(hostname)) {
    accountsState =
      accountsResult?.hostname === hostname ? accountsResult.state : { status: 'loading' };
  }

  const offeredAccounts = accountsState.status === 'ready' ? accountsState.accounts : [];
  const reAuthUUID = reAuthAccount && getAccountUUID(reAuthAccount);
  const enrolledForHost = enrolledAccounts.filter(
    (account) =>
      account.forge === 'github' &&
      account.hostname.toLowerCase() === hostname.toLowerCase() &&
      getAccountUUID(account) !== reAuthUUID,
  );
  const isEnrolled = ({ identity }: CliAccountChoice) =>
    enrolledForHost.some(
      (account) =>
        (account.cliIdentity && sameIdentity(account.cliIdentity, identity)) ||
        (identity.kind === 'account' &&
          account.user?.login.toLowerCase() === identity.login.toLowerCase()),
    );
  const availableAccounts = offeredAccounts.filter((account) => !isEnrolled(account));
  const defaultIdentity = preferredIdentity(availableAccounts, pinnedIdentity);

  const selectedIdentity =
    userSelection?.hostname === hostname ? userSelection.identity : defaultIdentity;
  const selectedAccount = selectedIdentity
    ? availableAccounts.find((account) => sameIdentity(account.identity, selectedIdentity))
    : undefined;

  const pinnedStillOffered =
    !pinnedIdentity ||
    accountsState.status !== 'ready' ||
    availableAccounts.some((account) => sameIdentity(account.identity, pinnedIdentity));

  const allEnrolled = offeredAccounts.length > 0 && availableAccounts.length === 0;
  const showPicker = offeredAccounts.length > 1 || allEnrolled || !pinnedStillOffered;

  const accountChoiceReady =
    accountsState.status === 'unsupported' ||
    accountsState.status === 'idle' ||
    selectedAccount !== undefined;

  const selectIdentity = useCallback(
    (value: string) => {
      setUserSelection({ hostname, identity: identityFromValue(value) });
    },
    [hostname],
  );

  const handleSubmit = async () => {
    if (!hostname || !isValidHostname(hostname)) {
      setError(i18n.t('login.cli.hostname_invalid', 'Hostname format is invalid'));
      return;
    }

    if (!accountChoiceReady) {
      setError(i18n.t('login.cli.account_required', 'Choose an account'));
      return;
    }

    setError(null);
    setIsLoggingIn(true);

    try {
      await loginWithCli('github', hostname, selectedAccount?.identity);
      void navigate('/');
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
  };

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
          <Stack direction="vertical" gap="condensed">
            <Text as="p" className="text-xs">
              {t(
                'login.cli.intro',
                'Gitify uses your existing GitHub CLI login. There’s no token to paste, and Gitify picks up token refreshes automatically.',
              )}
            </Text>
            <Text as="p" className="text-xs">
              {t(
                'login.cli.intro_scopes',
                'Before adding the account, Gitify checks for notification access. Either “repo” or “notifications” is enough.',
              )}
            </Text>
          </Stack>

          <FormControl required>
            <FormControl.Label>{t('login.cli.hostname', 'Hostname')}</FormControl.Label>
            <FormControl.Caption>
              <Text as="i">
                {t('login.cli.hostname_caption', 'Change only for GitHub Enterprise Server.')}
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

          {accountsState.status === 'loading' && (
            <Stack align="center" direction="horizontal" gap="condensed">
              <Spinner size="small" />
              <Text className="text-xs">
                {t('login.cli.accounts_loading', 'Loading GitHub CLI accounts…')}
              </Text>
            </Stack>
          )}

          {accountsState.status === 'failed' && (
            <Text as="p" className="text-xs" style={{ color: 'var(--fgColor-danger)' }}>
              {t(
                'login.cli.accounts_failed',
                'Could not load GitHub CLI accounts for {{hostname}}.',
                { hostname },
              )}
            </Text>
          )}

          {accountsState.status === 'ready' && accountsState.accounts.length === 0 && (
            <Banner
              data-testid="login-cli-no-accounts"
              description={
                <Text>
                  {t(
                    'login.cli.no_accounts',
                    'No usable accounts for {{hostname}}. Run `gh auth login --hostname {{hostname}}`.',
                    { hostname },
                  )}
                </Text>
              }
              hideTitle
              title={t('login.cli.form_errors', 'Form errors')}
              variant="warning"
            />
          )}

          {accountsState.status === 'unsupported' && (
            <Text as="p" className="text-xs">
              {t(
                'login.cli.accounts_unsupported',
                'Using the active account. Update GitHub CLI to choose another.',
              )}
            </Text>
          )}

          {showPicker && accountsState.status === 'ready' && (
            <FormControl required>
              <FormControl.Label>{t('login.cli.account', 'Account')}</FormControl.Label>
              <Select
                data-testid="login-cli-account"
                onChange={(e) => selectIdentity(e.target.value)}
                value={selectedAccount ? identityValue(selectedAccount.identity) : ''}
              >
                <Select.Option disabled={allEnrolled} value="">
                  {allEnrolled
                    ? t('login.cli.all_accounts_enrolled', 'All accounts already in Gitify')
                    : t('login.cli.account_placeholder', 'Select an account')}
                </Select.Option>
                {offeredAccounts.map((account) => {
                  const enrolled = isEnrolled(account);
                  let label =
                    account.identity.kind === 'environment'
                      ? t('login.cli.environment_token', 'Environment token')
                      : account.identity.login;

                  if (enrolled) {
                    label = t('login.cli.account_enrolled', '{{login}} (already in Gitify)', {
                      login: label,
                    });
                  } else if (account.active && account.identity.kind === 'account') {
                    label = t('login.cli.account_active', '{{login}} (active)', { login: label });
                  }

                  return (
                    <Select.Option
                      disabled={enrolled}
                      key={identityValue(account.identity)}
                      value={identityValue(account.identity)}
                    >
                      {label}
                    </Select.Option>
                  );
                })}
              </Select>
            </FormControl>
          )}
        </Stack>
      </Contents>

      <Footer justify="end">
        <Button
          data-testid="login-submit"
          disabled={!accountChoiceReady}
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

async function loadAccounts(hostname: Hostname): Promise<AccountsState> {
  const { cliAuth } = getAdapter('github');

  if (!cliAuth) {
    return { status: 'unsupported' };
  }

  try {
    const result = await cliAuth.listAccounts(hostname);

    if (result.error) {
      return result.error === 'CLI_UNSUPPORTED'
        ? { status: 'unsupported' }
        : { status: 'failed', error: result.error };
    }

    return { status: 'ready', accounts: result.accounts };
  } catch {
    return { status: 'failed', error: 'CLI_FAILED' };
  }
}
