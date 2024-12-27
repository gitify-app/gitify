import {
  FeedPersonIcon,
  KeyIcon,
  MarkGithubIcon,
  PersonIcon,
  PlusIcon,
  SignOutIcon,
  StarFillIcon,
  StarIcon,
  SyncIcon,
} from '@primer/octicons-react';

import log from 'electron-log';
import { type FC, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { AuthMethodIcon } from '../components/icons/AuthMethodIcon';
import { AvatarIcon } from '../components/icons/AvatarIcon';
import { PlatformIcon } from '../components/icons/PlatformIcon';
import { AppContext } from '../context/App';
import { BUTTON_CLASS_NAME } from '../styles/gitify';
import { type Account, IconColor, Size } from '../types';
import { getAccountUUID, refreshAccount } from '../utils/auth/utils';
import { cn } from '../utils/cn';
import { updateTrayIcon, updateTrayTitle } from '../utils/comms';
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
          {auth.accounts.map((account, i) => (
            <div
              key={getAccountUUID(account)}
              className="mb-4 flex items-center justify-between rounded-md bg-gray-100 p-2 dark:bg-gray-sidebar"
            >
              <div className="ml-2 text-xs">
                <div>
                  <button
                    type="button"
                    className="flex flex-1 gap-2 items-center justify-center mb-1 cursor-pointer text-sm font-semibold"
                    title="Open Profile"
                    onClick={() => openAccountProfile(account)}
                  >
                    <AvatarIcon
                      title={account.user.login}
                      url={account.user.avatar}
                      size={Size.MEDIUM}
                      defaultIcon={FeedPersonIcon}
                    />
                    @{account.user.login}
                    <span
                      hidden={!account.user?.name}
                      className="text-xs font-medium italic"
                    >
                      ({account.user?.name})
                    </span>
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    className="flex items-center mb-1 ml-1 cursor-pointer align-middle"
                    title="Open Host"
                    onClick={() => openHost(account.hostname)}
                  >
                    <PlatformIcon type={account.platform} size={Size.XSMALL} />
                    {account.hostname}
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    className="flex items-center ml-1 cursor-pointer align-middle"
                    title="Open Developer Settings"
                    onClick={() => openDeveloperSettings(account)}
                  >
                    <AuthMethodIcon type={account.method} size={Size.XSMALL} />
                    {account.method}
                  </button>
                </div>
              </div>
              <div>
                <button
                  type="button"
                  className={cn(BUTTON_CLASS_NAME, 'px-0', 'cursor-default')}
                  title="Primary account"
                  hidden={i !== 0}
                >
                  <StarFillIcon
                    size={Size.XLARGE}
                    className={IconColor.YELLOW}
                    aria-label="Primary account"
                  />
                </button>
                <button
                  type="button"
                  className={cn(BUTTON_CLASS_NAME, 'px-0')}
                  title="Set as primary account"
                  onClick={() => setAsPrimaryAccount(account)}
                  hidden={i === 0}
                >
                  <StarIcon
                    size={Size.XLARGE}
                    className={IconColor.YELLOW}
                    aria-label="Set as primary account"
                  />
                </button>
                <button
                  type="button"
                  className={cn(BUTTON_CLASS_NAME, 'px-0')}
                  title={`Refresh ${account.user.login}`}
                  onClick={async () => {
                    await refreshAccount(account);
                    navigate('/accounts', { replace: true });
                  }}
                >
                  <SyncIcon
                    size={Size.XLARGE}
                    aria-label={`Refresh ${account.user.login}`}
                  />
                </button>
                <button
                  type="button"
                  className={cn(BUTTON_CLASS_NAME, 'px-0')}
                  title={`Logout ${account.user.login}`}
                  onClick={() => logoutAccount(account)}
                >
                  <SignOutIcon
                    size={Size.XLARGE}
                    aria-label={`Logout ${account.user.login}`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between bg-gray-200 px-8 py-1 text-sm dark:bg-gray-darker">
        <div className="font-semibold italic">Add new account</div>
        <div className="flex items-center">
          <button
            type="button"
            className={cn('flex items-center', BUTTON_CLASS_NAME)}
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
            className={cn('flex items-center', BUTTON_CLASS_NAME)}
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
            className={cn('flex items-center', BUTTON_CLASS_NAME)}
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
