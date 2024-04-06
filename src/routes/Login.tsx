const { ipcRenderer } = require("electron");

import { FC, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Logo } from "../components/Logo";
import { AppContext } from "../context/App";

export const LoginRoute: FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AppContext);

  useEffect(() => {
    if (isLoggedIn) {
      ipcRenderer.send("reopen-window");
      navigate("/", { replace: true });
    }
  }, [isLoggedIn]);

  // FIXME: Temporarily disable Login with GitHub (OAuth) as it's currently broken and requires a rewrite - see #485 #561 #747
  /* const loginUser = useCallback(async () => {
    try {
      await login();
    } catch (err) {
      // Skip
    }
  }, []); */

  const loginButtonClass =
    "w-50 px-2 py-2 my-2 bg-gray-300 font-semibold rounded text-xs text-center dark:text-black hover:bg-gray-500 hover:text-white focus:outline-none";

  return (
    <div className="flex flex-1 flex-col justify-center items-center p-4 bg-white dark:bg-gray-dark dark:text-white">
      <Logo className="w-16 h-16" isDark />

      <div className="my-4 px-2.5 py-1.5 font-semibold text-center">
        GitHub Notifications <br /> on your menu bar.
      </div>

      {
        // FIXME: Temporarily disable Login with GitHub (OAuth) as it's currently broken and requires a rewrite - see #485 #561 #747
        /*      
      <button
        className={loginButtonClass}
        title="Login with GitHub"
        aria-label="Login with GitHub"
        onClick={loginUser}
      >
        Login to GitHub
      </button> */
      }

      <button
        className={loginButtonClass}
        title="Login with Personal Token"
        aria-label="Login with Personal Token"
        onClick={() => navigate("/login-token")}
      >
        Login with Personal Access Token
      </button>

      <button
        className={loginButtonClass}
        title="Login with GitHub Enterprise"
        aria-label="Login with GitHub Enterprise"
        onClick={() => navigate("/login-enterprise")}
      >
        Login to GitHub Enterprise
      </button>
    </div>
  );
};
