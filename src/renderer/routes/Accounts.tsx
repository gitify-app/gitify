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
  Button,
  IconButton,
  Stack,
  Text,
} from '@primer/react';

import { AvatarWithFallback } from '../components/avatars/AvatarWithFallback';
import { Contents } from '../components/layout/Contents';
import { Page } from '../components/layout/Page';
import { Footer } from '../components/primitives/Footer';
import { Header } from '../components/primitives/Header';
import { AppContext } from '../context/App';
import { type Account, Size } from '../types';
import {
  formatAlternateOAuthScopes,
  formatRecommendedOAuthScopes,
  getAccountUUID,
  refreshAccount,
} from '../utils/auth/utils';
import { updateTrayIcon, updateTrayTitle } from '../utils/comms';
import { getAuthMethodIcon, getPlatformIcon } from '../utils/icons';
import {
  openAccountProfile,
  openDeveloperSettings,
  openHost,
} from '../utils/links';
import { rendererLogError } from '../utils/logger';
import { saveState } from '../utils/storage';

export const AccountsRoute: FC = () => {
  const { auth, settings, loginWithGitHubApp, logoutFromAccount } =
    useContext(AppContext);
  const navigate = useNavigate();

  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {},
  );

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

  const handleRefresh = useCallback(async (account: Account) => {
    const accountUUID = getAccountUUID(account);

    setLoadingStates((prev) => ({
      ...prev,
      [accountUUID]: true,
    }));

    await refreshAccount(account);
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
  }, []);

  const loginWithGitHub = useCallback(async () => {
    try {
      await loginWithGitHubApp();
    } catch (err) {
      rendererLogError('loginWithGitHub', 'failed to login with GitHub', err);
    }
  }, []);

  const loginWithPersonalAccessToken = useCallback(() => {
    return navigate('/login-personal-access-token', { replace: true });
  }, []);

  const loginWithOAuthApp = useCallback(() => {
    return navigate('/login-oauth-app', { replace: true });
  }, []);

  return (
    <Page testId="accounts">
      <Header icon={PersonIcon}>Accounts</Header>

      <Contents>
        {auth.accounts.map((account, i) => {
          const AuthMethodIcon = getAuthMethodIcon(account.method);
          const PlatformIcon = getPlatformIcon(account.platform);
          const accountUUID = getAccountUUID(account);

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
                    title="Open account profile"
                  >
                    <AvatarWithFallback
                      alt={account.user.login}
                      name={`@${account.user.login}`}
                      size={Size.XLARGE}
                      src={account.user.avatar}
                    />
                  </Button>
                </Stack>

                <Stack
                  align="start"
                  direction="horizontal"
                  justify="space-between"
                >
                  <div className="pl-4 pb-2 text-xs">
                    <Stack direction="vertical" gap="condensed">
                      <Stack
                        align="center"
                        direction="horizontal"
                        gap="condensed"
                        hidden={!account.user.name}
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
                        title="Open host"
                      >
                        <PlatformIcon />
                        <Text>{account.hostname}</Text>
                      </Stack>

                      <Stack
                        align="center"
                        className="cursor-pointer"
                        data-testid="account-developer-settings"
                        direction="horizontal"
                        gap="condensed"
                        onClick={() => openDeveloperSettings(account)}
                        title="Open developer settings"
                      >
                        <AuthMethodIcon />
                        <Text>{account.method}</Text>
                      </Stack>
                    </Stack>
                  </div>

                  <Stack direction="horizontal" gap="condensed">
                    <IconButton
                      aria-label={`This account is missing one or more required scopes: [${formatRecommendedOAuthScopes()}] or [${formatAlternateOAuthScopes()}]`}
                      className={
                        account.hasRequiredScopes ? 'invisible' : 'visible'
                      }
                      data-testid="account-missing-scopes"
                      icon={AlertFillIcon}
                      onClick={() => openDeveloperSettings(account)}
                      size="small"
                      style={{ color: 'orange' }}
                    />

                    <IconButton
                      aria-label={
                        i === 0 ? 'Primary account' : 'Set as primary account'
                      }
                      data-testid="account-set-primary"
                      icon={i === 0 ? StarFillIcon : StarIcon}
                      onClick={() => setAsPrimaryAccount(account)}
                      size="small"
                      variant={i === 0 ? 'primary' : 'default'}
                    />

                    <IconButton
                      aria-label={`Refresh ${account.user.login}`}
                      data-testid="account-refresh"
                      icon={SyncIcon}
                      loading={loadingStates[accountUUID] || false}
                      onClick={() => handleRefresh(account)}
                      size="small"
                    />

                    <IconButton
                      aria-label={`Logout ${account.user.login}`}
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
                Login with Personal Access Token
              </ActionList.Item>

              <ActionList.Item
                data-testid="account-add-oauth-app"
                onSelect={() => loginWithOAuthApp()}
              >
                <ActionList.LeadingVisual>
                  <PersonIcon />
                </ActionList.LeadingVisual>
                Login with OAuth App
              </ActionList.Item>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </Footer>
    </Page>
  );
};
