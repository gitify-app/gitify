import log from 'electron-log';
import { type FC, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import {
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
  Tooltip,
} from '@primer/react';

import { Header } from '../components/Header';
import { AppContext } from '../context/App';
import { type Account, Size } from '../types';
import { getAccountUUID, refreshAccount } from '../utils/auth/utils';
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
      log.error('Auth: failed to login with GitHub', err);
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
        <div className="mt-4 flex flex-col text-sm">
          {auth.accounts.map((account, i) => {
            const AuthMethodIcon = getAuthMethodIcon(account.method);
            const PlatformIcon = getPlatformIcon(account.platform);

            return (
              <div
                key={getAccountUUID(account)}
                className="mb-4 flex items-center justify-between rounded-md bg-gray-100 p-2 dark:bg-gray-sidebar"
              >
                <Stack direction="vertical" gap="none">
                  <Tooltip text="Open profile" direction="e">
                    <Button onClick={() => openAccountProfile(account)}>
                      <Stack
                        direction="horizontal"
                        gap="condensed"
                        align="center"
                      >
                        <Avatar src={account.user.avatar} size={Size.XLARGE} />
                        <Text>@{account.user.login}</Text>
                        <Text as="i">({account.user?.name})</Text>
                      </Stack>
                    </Button>
                  </Tooltip>

                  <ActionList variant="inset">
                    <Tooltip text="Open Host" direction="e">
                      <ActionList.Item
                        onSelect={() => openHost(account.hostname)}
                      >
                        <ActionList.LeadingVisual>
                          <PlatformIcon />
                        </ActionList.LeadingVisual>
                        {account.hostname}
                      </ActionList.Item>
                    </Tooltip>

                    <Tooltip text="Open Developer Settings" direction="e">
                      <ActionList.Item
                        onSelect={() => openDeveloperSettings(account)}
                      >
                        <ActionList.LeadingVisual>
                          <AuthMethodIcon />
                        </ActionList.LeadingVisual>
                        {account.method}
                      </ActionList.Item>
                    </Tooltip>
                  </ActionList>
                </Stack>

                <Stack direction="horizontal" gap="condensed">
                  <IconButton
                    icon={i === 0 ? StarFillIcon : StarIcon}
                    aria-label={
                      i === 0 ? 'Primary account' : 'Set as primary account'
                    }
                    variant={i === 0 ? 'primary' : 'default'}
                    onClick={() => setAsPrimaryAccount(account)}
                  />
                  <IconButton
                    icon={SyncIcon}
                    aria-label={`Refresh ${account.user.login}`}
                    onClick={async () => {
                      await refreshAccount(account);
                      navigate('/accounts', { replace: true });
                    }}
                  />
                  <IconButton
                    icon={SignOutIcon}
                    aria-label={`Logout ${account.user.login}`}
                    variant="danger"
                    onClick={() => logoutAccount(account)}
                  />
                </Stack>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-end bg-gray-200 px-8 py-1 text-sm dark:bg-gray-darker">
        <ActionMenu>
          <ActionMenu.Anchor>
            <Button leadingVisual={PersonAddIcon}>Add new account</Button>
          </ActionMenu.Anchor>

          <ActionMenu.Overlay width="medium">
            <ActionList>
              <ActionList.Item onSelect={() => loginWithGitHub()}>
                <ActionList.LeadingVisual>
                  <MarkGithubIcon />
                </ActionList.LeadingVisual>
                Login with GitHub
              </ActionList.Item>

              <ActionList.Item onSelect={() => loginWithPersonalAccessToken()}>
                <ActionList.LeadingVisual>
                  <KeyIcon />
                </ActionList.LeadingVisual>
                Login with Personal Access Token
              </ActionList.Item>

              <ActionList.Item onSelect={() => loginWithOAuthApp()}>
                <ActionList.LeadingVisual>
                  <PersonIcon />
                </ActionList.LeadingVisual>
                Login with OAuth App{' '}
              </ActionList.Item>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </div>
    </div>
  );
};
