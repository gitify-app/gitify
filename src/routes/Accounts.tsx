import {
  ArrowLeftIcon,
  KeyIcon,
  PersonIcon,
  PlusIcon,
  SignOutIcon,
} from '@primer/octicons-react';

import { type FC, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppContext } from '../context/App';

import { AuthMethodIcon } from '../components/icons/AuthMethodIcon';
import { PlatformIcon } from '../components/icons/PlatformIcon';
import type { Account } from '../types';
import { getAccountUUID, getDeveloperSettingsURL } from '../utils/auth/utils';
import {
  openExternalLink,
  updateTrayIcon,
  updateTrayTitle,
} from '../utils/comms';
import { openProfile } from '../utils/helpers';

export const AccountsRoute: FC = () => {
  const { auth, logoutFromAccount } = useContext(AppContext);
  const navigate = useNavigate();

  const logoutAccount = useCallback((account: Account) => {
    logoutFromAccount(account);
    navigate(-1);
    updateTrayIcon();
    updateTrayTitle();
  }, []);

  const openHost = (hostname: string) => {
    openExternalLink(`https://${hostname}`);
  };

  const openDeveloperSettings = (account: Account) => {
    const url = getDeveloperSettingsURL(account);
    openExternalLink(url);
  };

  const loginWithPersonalAccessToken = useCallback(() => {
    return navigate('/login-personal-access-token', { replace: true });
  }, []);

  const loginWithOAuthApp = useCallback(() => {
    return navigate('/login-oauth-app', { replace: true });
  }, []);

  const buttonClass =
    'hover:text-gray-500 py-1 px-2 my-1 mx-2 focus:outline-none';

  return (
    <div
      className="flex flex-1 flex-col h-screen dark:bg-gray-dark dark:text-white"
      data-testid="accounts"
    >
      <div className="flex justify-between items-center mt-2 py-2 mx-8">
        <button
          type="button"
          className="focus:outline-none"
          title="Go Back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon
            size={20}
            className="hover:text-gray-400"
            aria-label="Go Back"
          />
        </button>

        <h3 className="text-lg font-semibold">Accounts</h3>
      </div>

      <div className="flex-grow overflow-x-auto px-8">
        <div className="flex flex-col mt-4 text-sm">
          {auth.accounts.map((account) => (
            <div
              key={getAccountUUID(account)}
              className="flex justify-between items-center bg-gray-100 dark:bg-gray-900 rounded-md p-1 mb-4"
            >
              <div className="ml-2 text-xs">
                <button
                  type="button"
                  className="cursor-pointer font-semibold mb-1 text-sm"
                  title="Open Profile"
                  onClick={() => openProfile(account)}
                >
                  @{account.user.login}
                  <span
                    hidden={!account.user?.name}
                    className="pl-1 font-medium text-xs italic"
                  >
                    - {account.user?.name}
                  </span>
                </button>

                <button
                  type="button"
                  className="cursor-pointer mb-1 ml-1 align-middle"
                  title="Open Host"
                  onClick={() => openHost(account.hostname)}
                >
                  <PlatformIcon type={account.platform} size={12} />
                  {account.platform} - {account.hostname}
                </button>
                <button
                  type="button"
                  className="cursor-pointer ml-1 align-middle"
                  title="Open Developer Settings"
                  onClick={() => openDeveloperSettings(account)}
                >
                  <AuthMethodIcon type={account.method} size={12} />
                  {account.method}
                </button>
              </div>
              <div>
                <button
                  type="button"
                  className={buttonClass}
                  title={`Logout ${account.user.login}`}
                  onClick={() => logoutAccount(account)}
                >
                  <SignOutIcon
                    size={20}
                    aria-label={`Logout ${account.user.login}`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center bg-gray-200 dark:bg-gray-darker py-1 px-8 text-sm">
        <div className="font-semibold italic">Add new account</div>
        <div>
          <button
            type="button"
            className={buttonClass}
            title="Login with Personal Access Token"
            onClick={loginWithPersonalAccessToken}
          >
            <KeyIcon size={18} aria-label="Login with Personal Access Token" />
            <PlusIcon size={10} className="ml-1 mb-2" />
          </button>
          <button
            type="button"
            className={buttonClass}
            title="Login with OAuth App"
            onClick={loginWithOAuthApp}
          >
            <PersonIcon size={20} aria-label="Login with OAuth App" />
            <PlusIcon size={10} className="mb-2" />
          </button>
        </div>
      </div>
    </div>
  );
};
