const { ipcRenderer } = require('electron');

import React, { useCallback, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppContext } from '../context/App';
import { Logo } from '../components/Logo';

export const LoginRoute: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, login } = useContext(AppContext);

  useEffect(() => {
    if (isLoggedIn) {
      ipcRenderer.send('reopen-window');
      navigate('/', { replace: true });
    }
  }, [isLoggedIn]);

  const loginUser = useCallback(async () => {
    try {
      await login();
    } catch (err) {
      // Skip
    }
  }, []);

  const loginButtonClass =
    'w-48 py-2 my-2 bg-gray-300 font-semibold rounded text-xs text-center dark:text-black hover:bg-gray-500 hover:text-white focus:outline-none';

  return (
    <div className="flex flex-1 flex-col justify-center items-center p-4 bg-white dark:bg-gray-dark dark:text-white">
      <Logo className="w-16 h-16" isDark />

      <div className="my-4 px-2.5 py-1.5 font-semibold text-center">
        GitHub Notifications <br /> on your menu bar.
      </div>

      <button
        className={loginButtonClass}
        onClick={loginUser}
        aria-label="Login with GitHub"
      >
        Login to GitHub
      </button>

      <button
        className={loginButtonClass}
        onClick={() => navigate('/login-enterprise')}
        aria-label="Login with GitHub Enterprise"
      >
        Login to GitHub Enterprise
      </button>

      <button
        className="bg-none hover:text-gray-800 dark:text-gray-100 dark:hover:text-gray-300 mt-4 focus:outline-none"
        onClick={() => navigate('/login-token')}
        aria-label="Login with Personal Token"
      >
        <small>or login with a personal token</small>
      </button>
    </div>
  );
};
