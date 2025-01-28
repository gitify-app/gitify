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
  Box,
  Button,
  IconButton,
  Stack,
  Text,
} from '@primer/react';

import { logError } from '../../shared/logger';
import { AvatarWithFallback } from '../components/avatars/AvatarWithFallback';
import { Contents } from '../components/layout/Contents';
import { Page } from '../components/layout/Page';
import { Footer } from '../components/primitives/Footer';
import { Header } from '../components/primitives/Header';
import { AppContext } from '../context/App';
import { type Account, Size } from '../types';
import {
  formatRequiredScopes,
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
    <Page id="accounts">
      <Header icon={PersonIcon}>Accounts</Header>

      <Contents>
        {auth.accounts.map((account, i) => {
          const AuthMethodIcon = getAuthMethodIcon(account.method);
          const PlatformIcon = getPlatformIcon(account.platform);
          const accountUUID = getAccountUUID(account);

          return (
            <Box
              key={accountUUID}
              className="rounded-md p-2 mb-4 bg-gitify-accounts"
            >
              <Stack
                direction="horizontal"
                gap="condensed"
                align="center"
                justify="space-between"
              >
                <Stack direction="vertical" align="start" gap="condensed">
                  <Button
                    title="Open account profile"
                    onClick={() => openAccountProfile(account)}
                    data-testid="account-profile"
                  >
                    <AvatarWithFallback
                      src={account.user.avatar}
                      alt={account.user.login}
                      name={`@${account.user.login}`}
                      size={Size.XLARGE}
                    />
                  </Button>

                  <Box className="pl-4 pb-2 text-xs">
                    <Stack direction="vertical" gap="condensed">
                      <Box hidden={!account.user.name}>
                        <Stack
                          direction="horizontal"
                          gap="condensed"
                          align="center"
                        >
                          <PersonIcon />
                          <Text>{account.user?.name}</Text>
                        </Stack>
                      </Box>

                      <Box
                        title="Open host"
                        onClick={() => openHost(account.hostname)}
                        className="cursor-pointer"
                        data-testid="account-host"
                      >
                        <Stack
                          direction="horizontal"
                          gap="condensed"
                          align="center"
                        >
                          <PlatformIcon />
                          <Text>{account.hostname}</Text>
                        </Stack>
                      </Box>

                      <Box
                        title="Open developer settings"
                        onClick={() => openDeveloperSettings(account)}
                        className="cursor-pointer"
                        data-testid="account-developer-settings"
                      >
                        <Stack
                          direction="horizontal"
                          gap="condensed"
                          align="center"
                        >
                          <AuthMethodIcon />
                          <Text>{account.method}</Text>
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>

                <Stack direction="horizontal" gap="condensed">
                  <IconButton
                    icon={AlertFillIcon}
                    aria-label={`This account is missing one or more required scopes: [${formatRequiredScopes()}]`}
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
                    onClick={() => handleRefresh(account)}
                    size="small"
                    loading={loadingStates[accountUUID] || false}
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
            </Box>
          );
        })}
      </Contents>

      <Footer justify="end">
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
      </Footer>
    </Page>
  );
};
