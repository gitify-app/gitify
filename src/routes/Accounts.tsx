import {
  ArrowLeftIcon,
  PersonAddIcon,
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
  const { accounts, logout, logoutEnterprise } = useContext(AppContext);
  const navigate = useNavigate();

  const logoutUser = useCallback(() => {
    logout();
    navigate(-1);
    updateTrayIcon();
    updateTrayTitle();
  }, []);

  const openProfile = (username) => {
    openExternalLink(new URL(username, 'https://github.com/').href);
  };

  const openEnterpriseServer = (hostname) => {
    openExternalLink(`https://${hostname}`);
  };

  const goToLoginEnterprise = useCallback(() => {
    return navigate('/login-enterprise', { replace: true });
  }, []);

  const goToLogin = useCallback(() => {
    return navigate('/login', { replace: true });
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
        <div className="flex justify-between items-center">
          <div className="text-m font-semibold my-2">GitHub.com</div>
          {!accounts?.token && (
            <div>
              <button type="button" className={buttonClass} onClick={goToLogin}>
                <PersonAddIcon size={16} className="mr-2" />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col bg-gray-100 dark:bg-gray-900 rounded-lg p-2">
          <div className="flex justify-between items-center ml-2">
            {accounts?.token && (
              <>
                <div
                  className="text-sm font-semibold cursor-pointer"
                  title="View Profile"
                  onClick={() => openProfile(accounts.user.login)}
                  onKeyDown={() => openProfile(accounts.user.login)}
                >
                  @{accounts.user.login}{' '}
                  <span className="text-xs italic">({accounts.user.name})</span>
                </div>
                <div className="flex">
                  <button
                    type="button"
                    className={buttonClass}
                    title="Logout"
                    onClick={logoutUser}
                  >
                    <SignOutIcon size={16} aria-label="Logout" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col mt-4">
          <div className="flex justify-between items-center">
            <div className="text-m font-semibold my-2">
              GitHub Enterprise Server
            </div>
            <div>
              <button
                type="button"
                className={buttonClass}
                onClick={goToLoginEnterprise}
              >
                <PersonAddIcon size={16} className="mr-2" />
              </button>
            </div>
          </div>

          {accounts.enterpriseAccounts.map((enterpriseAccount) => (
            <div
              key={enterpriseAccount.hostname}
              className="flex flex-col bg-gray-100 dark:bg-gray-900 rounded-lg p-2"
            >
              <div className="flex justify-between items-center ml-2">
                <div className="flex flex-col">
                  <div
                    className="text-sm font-semibold cursor-pointer"
                    title="View Enterprise Server"
                    onClick={() =>
                      openEnterpriseServer(enterpriseAccount.hostname)
                    }
                    onKeyDown={() =>
                      openEnterpriseServer(enterpriseAccount.hostname)
                    }
                  >
                    {enterpriseAccount.hostname}
                  </div>
                </div>

                <div className="flex">
                  <button
                    type="button"
                    className={buttonClass}
                    title="Logout"
                    onClick={() => logoutEnterprise(enterpriseAccount.hostname)}
                  >
                    <SignOutIcon size={16} aria-label="Logout" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
