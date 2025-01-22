import { type FC, useCallback, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  AlertFillIcon,
  KeyIcon,
  MarkGithubIcon,
  PersonAddIcon,
  PersonIcon,
  SignOutIcon,
  StarFillIcon,
  StarIcon,
  SyncIcon,
} from '@primer/octicons-react';
import {
  ActionList,
  ActionMenu,
  Avatar,
  Button,
  IconButton,
  Stack,
  Text,
} from '@primer/react';

import { logError } from '../../shared/logger';
import { Header } from '../components/primitives/Header';
import { AppContext } from '../context/App';
import { type Account, Size } from '../types';
import { getAccountUUID, refreshAccount } from '../utils/auth/utils';
import { updateTrayIcon, updateTrayTitle } from '../utils/comms';
import { Constants } from '../utils/constants';
import { getAuthMethodIcon, getPlatformIcon } from '../utils/icons';
import {
  openAccountProfile,
  openDeveloperSettings,
  openHost,
} from '../utils/links';
import { saveState } from '../utils/storage';

export const AccountsRoute: FC = () => {
  const { auth, settings, loginWithGitHubApp, logoutFromAccount } =
    useContext(AppContext);
  const navigate = useNavigate();

  const logoutAccount = useCallback(
    (account: Account) => {
      logoutFromAccount(account);
      navigate(-1);
      updateTrayIcon();
      updateTrayTitle();
    },
    [logoutFromAccount],
  );

  const setAsPrimaryAccount = useCallback((account: Account) => {
    auth.accounts = [account, ...auth.accounts.filter((a) => a !== account)];
    saveState({ auth, settings });
    navigate('/accounts', { replace: true });
  }, []);

  const loginWithGitHub = useCallback(async () => {
    try {
      await loginWithGitHubApp();
    } catch (err) {
      logError('loginWithGitHub', 'failed to login with GitHub', err);
    }
  }, []);

  const loginWithPersonalAccessToken = useCallback(() => {
    return navigate('/login-personal-access-token', { replace: true });
  }, []);

  const loginWithOAuthApp = useCallback(() => {
    return navigate('/login-oauth-app', { replace: true });
  }, []);

  return (
    <div className="flex h-screen flex-col" data-testid="accounts">
      <Header icon={PersonIcon}>Accounts</Header>
      <div className="flex-grow overflow-x-auto px-8">
        <div className="mt-4 flex flex-col">
          {auth.accounts.map((account, i) => {
            const AuthMethodIcon = getAuthMethodIcon(account.method);
            const PlatformIcon = getPlatformIcon(account.platform);
            const [isRefreshingAccount, setIsRefreshingAccount] =
              useState(false);

            return (
              <div
                key={getAccountUUID(account)}
                className="rounded-md p-2 pb-0 bg-gitify-accounts"
              >
                <Stack
                  direction="horizontal"
                  gap="condensed"
                  align="center"
                  justify="space-between"
                >
                  <Stack direction="vertical" gap="none">
                    <div className="pb-2">
                      <Button
                        title="Open account profile"
                        onClick={() => openAccountProfile(account)}
                        data-testid="account-profile"
                      >
                        <Stack
                          direction="horizontal"
                          gap="condensed"
                          align="center"
                        >
                          <Avatar
                            src={account.user.avatar}
                            size={Size.XLARGE}
                          />
                          <Text>@{account.user.login}</Text>
                        </Stack>
                      </Button>
                    </div>

                    <div className="pb-2 pl-4">
                      <Stack direction="vertical" gap="condensed">
                        <div hidden={!account.user.name}>
                          <Stack
                            direction="horizontal"
                            gap="condensed"
                            align="center"
                          >
                            <PersonIcon />
                            <span className="text-xs">
                              {account.user?.name}
                            </span>
                          </Stack>
                        </div>

                        <button
                          title="Open host"
                          type="button"
                          onClick={() => openHost(account.hostname)}
                          data-testid="account-host"
                        >
                          <Stack
                            direction="horizontal"
                            gap="condensed"
                            align="center"
                          >
                            <PlatformIcon />
                            <span className="text-xs">{account.hostname}</span>
                          </Stack>
                        </button>

                        <button
                          title="Open developer settings"
                          type="button"
                          onClick={() => openDeveloperSettings(account)}
                          data-testid="account-developer-settings"
                        >
                          <Stack
                            direction="horizontal"
                            gap="condensed"
                            align="center"
                          >
                            <AuthMethodIcon />
                            <span className="text-xs">{account.method}</span>
                          </Stack>
                        </button>
                      </Stack>
                    </div>
                  </Stack>

                  <Stack direction="horizontal" gap="condensed">
                    <IconButton
                      icon={AlertFillIcon}
                      aria-label={`This account is missing one or more required scopes: [${Constants.AUTH_SCOPE.join(', ')}]`}
                      variant="danger"
                      onClick={() => openDeveloperSettings(account)}
                      size="small"
                      data-testid="account-missing-scopes"
                      className={
                        account.hasRequiredScopes ? 'invisible' : 'visible'
                      }
                    />

                    <IconButton
                      icon={i === 0 ? StarFillIcon : StarIcon}
                      aria-label={
                        i === 0 ? 'Primary account' : 'Set as primary account'
                      }
                      variant={i === 0 ? 'primary' : 'default'}
                      onClick={() => setAsPrimaryAccount(account)}
                      size="small"
                      data-testid="account-set-primary"
                    />

                    <IconButton
                      icon={SyncIcon}
                      aria-label={`Refresh ${account.user.login}`}
                      onClick={async () => {
                        setIsRefreshingAccount(true);

                        await refreshAccount(account);
                        navigate('/accounts', { replace: true });

                        /**
                         * Typically the above refresh API call completes very quickly,
                         * so we add an brief artificial delay to allow the icon to spin a few times
                         */
                        setTimeout(() => {
                          setIsRefreshingAccount(false);
                        }, 500);
                      }}
                      size="small"
                      loading={isRefreshingAccount}
                      data-testid="account-refresh"
                    />

                    <IconButton
                      icon={SignOutIcon}
                      aria-label={`Logout ${account.user.login}`}
                      variant="danger"
                      onClick={() => logoutAccount(account)}
                      size="small"
                      data-testid="account-logout"
                    />
                  </Stack>
                </Stack>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-end px-8 py-1 text-sm bg-gitify-footer">
        <ActionMenu>
          <ActionMenu.Anchor>
            <Button leadingVisual={PersonAddIcon} data-testid="account-add-new">
              Add new account
            </Button>
          </ActionMenu.Anchor>

          <ActionMenu.Overlay width="medium">
            <ActionList>
              <ActionList.Item
                onSelect={() => loginWithGitHub()}
                data-testid="account-add-github"
              >
                <ActionList.LeadingVisual>
                  <MarkGithubIcon />
                </ActionList.LeadingVisual>
                Login with GitHub
              </ActionList.Item>

              <ActionList.Item
                onSelect={() => loginWithPersonalAccessToken()}
                data-testid="account-add-pat"
              >
                <ActionList.LeadingVisual>
                  <KeyIcon />
                </ActionList.LeadingVisual>
                Login with Personal Access Token
              </ActionList.Item>

              <ActionList.Item
                onSelect={() => loginWithOAuthApp()}
                data-testid="account-add-oauth-app"
              >
                <ActionList.LeadingVisual>
                  <PersonIcon />
                </ActionList.LeadingVisual>
                Login with OAuth App
              </ActionList.Item>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </div>
    </div>
  );
};
