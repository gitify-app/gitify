import { KeyIcon, MarkGithubIcon, PersonIcon } from '@primer/octicons-react';
import log from 'electron-log';
import { type FC, useCallback, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/buttons/Button';
import { BitbucketIcon } from '../components/icons/BitbucketIcon';
import { LogoIcon } from '../components/icons/LogoIcon';
import { AppContext } from '../context/App';
import { Size } from '../types';
import { showWindow } from '../utils/comms';

export const LoginRoute: FC = () => {
  const navigate = useNavigate();
  const { loginWithGitHubApp, isLoggedIn } = useContext(AppContext);

  useEffect(() => {
    if (isLoggedIn) {
      showWindow();
      navigate('/', { replace: true });
    }
  }, [isLoggedIn]);

  const loginUser = useCallback(async () => {
    try {
      await loginWithGitHubApp();
    } catch (err) {
      log.error('Auth: failed to login with GitHub', err);
    }
  }, [loginWithGitHubApp]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <LogoIcon size={Size.LARGE} isDark />

      <div className="my-4 px-2.5 py-1.5 text-center font-semibold">
        GitHub Notifications <br /> on your menu bar.
      </div>

      <div className="text-center text-sm font-semibold italic">Login with</div>

      <Button
        name="GitHub"
        icon={{ icon: MarkGithubIcon }}
        label="Login with GitHub"
        className="mt-2 py-2"
        onClick={() => loginUser()}
      >
        GitHub
      </Button>

      <Button
        icon={{ icon: KeyIcon }}
        label="Login with Personal Access Token"
        className="mt-2 py-2"
        onClick={() => navigate('/login-personal-access-token')}
      >
        Personal Access Token
      </Button>
      <Button
        icon={{ icon: PersonIcon }}
        label="Login with OAuth App"
        className="mt-2 py-2"
        onClick={() => navigate('/login-oauth-app')}
      >
        OAuth App
      </Button>
      <Button
        label="Login with Bitbucket Cloud"
        className="mt-2 py-2"
        onClick={() => navigate('/login-bitbucket-cloud')}
      >
        <BitbucketIcon size={Size.SMALL} /> Bitbucket Cloud
      </Button>
    </div>
  );
};
