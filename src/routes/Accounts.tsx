import {
  ArrowLeftIcon,
  KeyIcon,
  MarkGithubIcon,
  PersonIcon,
  PlusIcon,
  ServerIcon,
  SignOutIcon,
} from '@primer/octicons-react';

import { type FC, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppContext } from '../context/App';

import {
  openExternalLink,
  updateTrayIcon,
  updateTrayTitle,
} from '../utils/comms';

export const AccountsRoute: FC = () => {
  const { auth, logoutFromAccount } = useContext(AppContext);
  const navigate = useNavigate();

  const logoutAccount = useCallback((account) => {
    logoutFromAccount(account);
    navigate(-1);
    updateTrayIcon();
    updateTrayTitle();
  }, []);

  const openAccount = (hostname) => {
    openExternalLink(`https://${hostname}`);
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
            <span
              key={account.hostname}
              className="flex justify-between items-center bg-gray-100 dark:bg-gray-900 rounded-md p-1 mb-2"
            >
              <div
                className="ml-2 cursor-pointer"
                title={account.platform}
                onClick={() => openAccount(account.hostname)}
                onKeyDown={() => openAccount(account.hostname)}
              >
                {account.platform === 'GitHub Cloud' ? (
                  <MarkGithubIcon size={16} aria-label="GitHub Cloud" />
                ) : (
                  <ServerIcon size={16} aria-label="GitHub Enterprise" />
                )}
              </div>
              <div title={account.user.name}>@{account.user.login}</div>
              <div title={account.method}>
                {account.method === 'Personal Access Token' ? (
                  <KeyIcon size={16} aria-label="Personal Access Token" />
                ) : null}
                {account.method === 'OAuth App' ? (
                  <PersonIcon size={16} aria-label="OAuth App" />
                ) : null}
              </div>

              <div>
                <button
                  type="button"
                  className={buttonClass}
                  title="Logout from account"
                  onClick={() => logoutAccount(account)}
                  onKeyDown={() => logoutAccount(account)}
                >
                  <SignOutIcon size={16} aria-label="Logout from account" />
                </button>
              </div>
            </span>
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
