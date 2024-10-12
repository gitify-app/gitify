import {
  KeyIcon,
  MarkGithubIcon,
  PersonIcon,
  PlusIcon,
  SignOutIcon,
  StarFillIcon,
  StarIcon,
  SyncIcon,
} from '@primer/octicons-react';

import {
  Avatar,
  Button,
  CircleOcticon,
  IconButton,
  Stack,
  Text,
  Tooltip,
} from '@primer/react';
import log from 'electron-log';
import { type FC, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { AppContext } from '../context/App';
import { BUTTON_CLASS_NAME } from '../styles/gitify';
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
            const authMethodIcon = getAuthMethodIcon(account.method);
            const platformIcon = getPlatformIcon(account.platform);

            return (
              <div
                key={getAccountUUID(account)}
                className="mb-4 flex items-center justify-between rounded-md bg-gray-100 p-2 dark:bg-gray-sidebar"
              >
                <Stack direction={'vertical'} gap={'condensed'}>
                  <Tooltip text="Open profile" direction="ne">
                    <Button onClick={() => openAccountProfile(account)}>
                      <Stack
                        direction={'horizontal'}
                        gap={'condensed'}
                        align={'center'}
                      >
                        <Avatar
                          src={account.user.avatar}
                          title={account.user.login}
                          size={Size.SMALL}
                        />
                        <Text>@{account.user.login}</Text>
                        <Text as="p" sx={{ hidden: !account.user?.name }}>
                          ({account.user?.name})
                        </Text>
                      </Stack>
                    </Button>
                  </Tooltip>

                  <Stack direction={'vertical'} className="ml-2">
                    <Tooltip text="Open Host" direction="ne">
                      <Button
                        leadingVisual={platformIcon}
                        size="small"
                        variant="invisible"
                        onClick={() => openHost(account.hostname)}
                      >
                        {account.hostname}
                      </Button>
                    </Tooltip>

                    <Tooltip text="Open Developer Settings" direction="ne">
                      <Button
                        leadingVisual={authMethodIcon}
                        size="small"
                        variant="invisible"
                        onClick={() => openDeveloperSettings(account)}
                      >
                        {account.method}
                      </Button>
                    </Tooltip>
                  </Stack>
                </Stack>
                <Stack direction={'horizontal'} gap={'condensed'}>
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

      <div className="flex items-center justify-between bg-gray-200 px-8 py-1 text-sm dark:bg-gray-darker">
        <div className="font-semibold italic">Add new account</div>
        <div>
          <button
            type="button"
            className={BUTTON_CLASS_NAME}
            title="Login with GitHub"
            onClick={loginWithGitHub}
          >
            <MarkGithubIcon
              size={Size.LARGE}
              aria-label="Login with GitHub App"
            />
            <PlusIcon size={Size.SMALL} className="mb-2 ml-1" />
          </button>
          <button
            type="button"
            className={BUTTON_CLASS_NAME}
            title="Login with Personal Access Token"
            onClick={loginWithPersonalAccessToken}
          >
            <KeyIcon
              size={Size.LARGE}
              aria-label="Login with Personal Access Token"
            />
            <PlusIcon size={Size.SMALL} className="mb-2 ml-1" />
          </button>
          <button
            type="button"
            className={BUTTON_CLASS_NAME}
            title="Login with OAuth App"
            onClick={loginWithOAuthApp}
          >
            <PersonIcon size={Size.XLARGE} aria-label="Login with OAuth App" />
            <PlusIcon size={Size.SMALL} className="mb-2" />
          </button>
        </div>
      </div>
    </div>
  );
};
