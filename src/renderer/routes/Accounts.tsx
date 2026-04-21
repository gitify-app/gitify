import { type FC, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  AlertFillIcon,
  KeyIcon,
  MarkGithubIcon,
  PersonAddIcon,
  PersonIcon,
  ServerIcon,
  ShieldCheckIcon,
  SignOutIcon,
  StarFillIcon,
  StarIcon,
  SyncIcon,
} from '@primer/octicons-react';
import {
  ActionList,
  ActionMenu,
  Button,
  IconButton,
  Stack,
  Text,
} from '@primer/react';

import { useAppContext } from '../hooks/useAppContext';

import { AvatarWithFallback } from '../components/avatars/AvatarWithFallback';
import { Contents } from '../components/layout/Contents';
import { Page } from '../components/layout/Page';
import { Footer } from '../components/primitives/Footer';
import { Header } from '../components/primitives/Header';

import { type Account, type GitifyError, IconColor, Size } from '../types';

import { determineFailureType } from '../utils/api/errors';
import { hasAlternateScopes, hasRecommendedScopes } from '../utils/auth/scopes';
import { getAccountUUID, refreshAccount } from '../utils/auth/utils';
import { Errors } from '../utils/core/errors';
import { toError } from '../utils/core/logger';
import { saveState } from '../utils/core/storage';
import {
  openAccountProfile,
  openDeveloperSettings,
  openHost,
} from '../utils/system/links';
import { getAuthMethodIcon, getPlatformIcon } from '../utils/ui/icons';

export const AccountsRoute: FC = () => {
  const navigate = useNavigate();

  const { auth, settings, logoutFromAccount, notifications } = useAppContext();

  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {},
  );

  const [refreshErrorStates, setRefreshErrorStates] = useState<
    Record<string, GitifyError>
  >({});

  const logoutAccount = useCallback(
    (account: Account) => {
      logoutFromAccount(account);
    },
    [logoutFromAccount],
  );

  const setAsPrimaryAccount = (account: Account) => {
    auth.accounts = [account, ...auth.accounts.filter((a) => a !== account)];
    saveState({ auth, settings });
    navigate('/accounts', { replace: true });
  };

  const handleRefresh = async (account: Account) => {
    const accountUUID = getAccountUUID(account);

    setLoadingStates((prev) => ({ ...prev, [accountUUID]: true }));
    setRefreshErrorStates((prev) => {
      const next = { ...prev };
      delete next[accountUUID];
      return next;
    });

    try {
      await refreshAccount(account);
    } catch (err) {
      setRefreshErrorStates((prev) => ({
        ...prev,
        [accountUUID]: determineFailureType(toError(err)),
      }));
    }

    navigate('/accounts', { replace: true });

    /**
     * Typically the above refresh API call completes very quickly,
     * so we add an brief artificial delay to allow the icon to spin a few times
     */
    setTimeout(() => {
      setLoadingStates((prev) => ({
        ...prev,
        [accountUUID]: false,
      }));
    }, 500);
  };

  const loginWithGitHub = async () => {
    return navigate('/login-device-flow', { replace: true });
  };

  const loginWithPersonalAccessToken = () => {
    return navigate('/login-personal-access-token', { replace: true });
  };

  const loginWithGiteaPersonalAccessToken = () => {
    return navigate('/login-personal-access-token', {
      replace: true,
      state: { forge: 'gitea' as const },
    });
  };

  const loginWithOAuthApp = () => {
    return navigate('/login-oauth-app', { replace: true });
  };

  const getAccountError = (account: Account) => {
    const accountUUID = getAccountUUID(account);
    return (
      refreshErrorStates[accountUUID] ??
      notifications.find((n) => getAccountUUID(n.account) === accountUUID)
        ?.error ??
      null
    );
  };

  const handleReAuthenticate = (account: Account) => {
    switch (account.method) {
      case 'GitHub App':
        return navigate('/login-device-flow', {
          replace: true,
          state: { account },
        });
      case 'Personal Access Token':
        return navigate('/login-personal-access-token', {
          replace: true,
          state: { account },
        });
      case 'OAuth App':
        return navigate('/login-oauth-app', {
          replace: true,
          state: { account },
        });
      default:
        break;
    }
  };

  return (
    <Page testId="accounts">
      <Header icon={PersonIcon}>Accounts</Header>

      <Contents>
        {auth.accounts.map((account, i) => {
          const AuthMethodIcon = getAuthMethodIcon(account.method);
          const PlatformIcon = getPlatformIcon(account.platform);
          const accountUUID = getAccountUUID(account);
          const accountError = getAccountError(account);
          const hasBadCredentials = accountError === Errors.BAD_CREDENTIALS;

          return (
            <div
              className="rounded-md p-2 mb-4 bg-gitify-accounts"
              key={accountUUID}
            >
              <Stack align="stretch" direction="vertical">
                <Stack align="start" direction="horizontal">
                  <Button
                    data-testid="account-profile"
                    onClick={() => openAccountProfile(account)}
                    title="Open account profile ↗"
                  >
                    <AvatarWithFallback
                      alt={account.user?.login}
                      name={`@${account.user?.login}`}
                      size={Size.XLARGE}
                      src={account.user?.avatar ?? undefined}
                    />
                  </Button>
                </Stack>

                <Stack
                  align="start"
                  direction="horizontal"
                  justify="space-between"
                >
                  <div className="pl-2 pb-2 text-xs">
                    <Stack direction="vertical" gap="condensed">
                      <Stack
                        align="center"
                        direction="horizontal"
                        gap="condensed"
                        hidden={!account.user?.name}
                      >
                        <PersonIcon />
                        <Text>{account.user?.name}</Text>
                      </Stack>

                      <Stack
                        align="center"
                        className="cursor-pointer"
                        data-testid="account-host"
                        direction="horizontal"
                        gap="condensed"
                        onClick={() => openHost(account.hostname)}
                        title="Open host ↗"
                      >
                        {PlatformIcon && <PlatformIcon />}
                        <Text>{account.hostname}</Text>
                      </Stack>

                      <Stack
                        align="center"
                        className="cursor-pointer"
                        data-testid="account-developer-settings"
                        direction="horizontal"
                        gap="condensed"
                        onClick={() => openDeveloperSettings(account)}
                        title="Open developer settings ↗"
                      >
                        {AuthMethodIcon && <AuthMethodIcon />}
                        <Text>{account.method}</Text>
                      </Stack>

                      {hasBadCredentials && (
                        <Stack
                          align="center"
                          className="cursor-pointer text-gitify-danger"
                          data-testid="account-bad-credentials"
                          direction="horizontal"
                          gap="condensed"
                          onClick={() => openDeveloperSettings(account)}
                          title="Open developer settings ↗"
                        >
                          <AlertFillIcon />
                          <Text>Invalid or expired credentials</Text>
                        </Stack>
                      )}
                    </Stack>
                  </div>

                  <Stack direction="horizontal" gap="condensed">
                    <IconButton
                      aria-label={`Set as primary account (${i === 0 ? 'current primary' : 'click to set'})`}
                      data-testid="account-set-primary"
                      icon={i === 0 ? StarFillIcon : StarIcon}
                      onClick={() => setAsPrimaryAccount(account)}
                      size="small"
                      variant={i === 0 ? 'primary' : 'default'}
                    />

                    {!hasBadCredentials && (
                      <IconButton
                        aria-label={`View scopes for ${account.user?.login}`}
                        data-testid="account-view-scopes"
                        icon={() => (
                          <ShieldCheckIcon
                            className={
                              hasRecommendedScopes(account)
                                ? IconColor.GREEN
                                : hasAlternateScopes(account)
                                  ? 'text-gitify-warning'
                                  : ''
                            }
                          />
                        )}
                        onClick={() =>
                          navigate('/account-scopes', {
                            state: { account },
                          })
                        }
                        size="small"
                        variant={
                          !hasRecommendedScopes(account) &&
                          !hasAlternateScopes(account)
                            ? 'danger'
                            : 'default'
                        }
                      />
                    )}

                    {hasBadCredentials && (
                      <IconButton
                        aria-label={`Re-authenticate ${account.user?.login}`}
                        data-testid="account-reauthenticate"
                        icon={KeyIcon}
                        onClick={() => handleReAuthenticate(account)}
                        size="small"
                        variant="danger"
                      />
                    )}

                    <IconButton
                      aria-label={`Refresh ${account.user?.login}`}
                      data-testid="account-refresh"
                      icon={SyncIcon}
                      loading={loadingStates[accountUUID] || false}
                      onClick={() => handleRefresh(account)}
                      size="small"
                    />

                    <IconButton
                      aria-label={`Logout ${account.user?.login}`}
                      data-testid="account-logout"
                      icon={SignOutIcon}
                      onClick={() => logoutAccount(account)}
                      size="small"
                      variant="danger"
                    />
                  </Stack>
                </Stack>
              </Stack>
            </div>
          );
        })}
      </Contents>

      <Footer justify="end">
        <ActionMenu>
          <ActionMenu.Anchor>
            <Button data-testid="account-add-new" leadingVisual={PersonAddIcon}>
              Add new account
            </Button>
          </ActionMenu.Anchor>

          <ActionMenu.Overlay width="medium">
            <ActionList>
              <ActionList.Item
                data-testid="account-add-github"
                onSelect={() => loginWithGitHub()}
              >
                <ActionList.LeadingVisual>
                  <MarkGithubIcon />
                </ActionList.LeadingVisual>
                Login with GitHub
              </ActionList.Item>

              <ActionList.Item
                data-testid="account-add-pat"
                onSelect={() => loginWithPersonalAccessToken()}
              >
                <ActionList.LeadingVisual>
                  <KeyIcon />
                </ActionList.LeadingVisual>
                GitHub (Personal Access Token)
              </ActionList.Item>

              <ActionList.Item
                data-testid="account-add-gitea-pat"
                onSelect={() => loginWithGiteaPersonalAccessToken()}
              >
                <ActionList.LeadingVisual>
                  <ServerIcon />
                </ActionList.LeadingVisual>
                Gitea (Personal Access Token)
              </ActionList.Item>

              <ActionList.Item
                data-testid="account-add-oauth-app"
                onSelect={() => loginWithOAuthApp()}
              >
                <ActionList.LeadingVisual>
                  <PersonIcon />
                </ActionList.LeadingVisual>
                GitHub (OAuth App)
              </ActionList.Item>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </Footer>
    </Page>
  );
};
