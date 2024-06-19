import { KeyIcon, PersonIcon } from '@primer/octicons-react';
import { type FC, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/buttons/Button';
import { LogoIcon } from '../components/icons/LogoIcon';
import { AppContext } from '../context/App';
import { showWindow } from '../utils/comms';

export const LoginRoute: FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AppContext);

  useEffect(() => {
    if (isLoggedIn) {
      showWindow();
      navigate('/', { replace: true });
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

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <LogoIcon size="large" isDark />

      <div className="my-4 px-2.5 py-1.5 text-center font-semibold">
        GitHub Notifications <br /> on your menu bar.
      </div>

      <div className="text-center text-sm font-semibold italic">Login with</div>
      {
        // FIXME: Temporarily disable Login with GitHub (OAuth) as it's currently broken and requires a rewrite - see #485 #561 #747
        /*    
       <Button
        name="GitHub"
        icon={MarkGitHubIcon}
        label="Login with GitHub"
        class="w-50 px-2 py-2 my-2 text-xs"
        onClick={loginUser}
      />  
      */
      }

      <Button
        name="Personal Access Token"
        icon={KeyIcon}
        label="Login with Personal Access Token"
        className="mt-2 py-2"
        onClick={() => navigate('/login-personal-access-token')}
      />
      <Button
        name="OAuth App"
        icon={PersonIcon}
        label="Login with OAuth App"
        className="mt-2 py-2"
        onClick={() => navigate('/login-oauth-app')}
      />
    </div>
  );
};
