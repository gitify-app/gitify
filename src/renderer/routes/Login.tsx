import log from 'electron-log';
import { type FC, useCallback, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { KeyIcon, MarkGithubIcon, PersonIcon } from '@primer/octicons-react';
import { Button, Heading, Stack, Text } from '@primer/react';

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

  const loginUser = useCallback(() => {
    try {
      loginWithGitHubApp();
    } catch (err) {
      log.error('Auth: failed to login with GitHub', err);
    }
  }, [loginWithGitHubApp]);

  return (
    <Stack direction={'vertical'} align={'center'}>
      <LogoIcon size={Size.LARGE} isDark />

      <Stack align={'center'} gap={'none'}>
        <Heading
          sx={{
            fontSize: 4,
          }}
        >
          GitHub Notifications
        </Heading>
        <Heading
          sx={{
            fontSize: 3,
          }}
        >
          on your menu bar
        </Heading>
      </Stack>

      <Stack align={'center'} gap={'condensed'}>
        <Text>Login with</Text>

        <Button
          leadingVisual={MarkGithubIcon}
          variant={'primary'}
          onClick={() => loginUser()}
        >
          GitHub
        </Button>

        <Button
          leadingVisual={KeyIcon}
          onClick={() => navigate('/login-personal-access-token')}
        >
          Personal Access Token
        </Button>

        <Button
          leadingVisual={PersonIcon}
          onClick={() => navigate('/login-oauth-app')}
        >
          OAuth App
        </Button>
      </Stack>
    </Stack>
  );
};
