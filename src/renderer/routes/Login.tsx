import { KeyIcon, MarkGithubIcon, PersonIcon } from '@primer/octicons-react';
import { Button, Heading, Stack, Text } from '@primer/react';
import { type FC, useCallback, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { logError } from '../../shared/logger';
import { LogoIcon } from '../components/icons/LogoIcon';
import { Centered } from '../components/layout/Centered';
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
      logError('loginWithGitHubApp', 'failed to login with GitHub', err);
    }
  }, [loginWithGitHubApp]);

  return (
    <Centered fullHeight={true}>
      <Stack direction="vertical" align="center">
        <LogoIcon size={Size.LARGE} isDark />

        <Stack align="center" gap="none">
          <Heading sx={{ fontSize: 4 }}>GitHub Notifications</Heading>
          <Heading sx={{ fontSize: 3 }}>on your menu bar</Heading>
        </Stack>

        <Stack align="center" gap="condensed">
          <Text>Login with</Text>

          <Button
            leadingVisual={MarkGithubIcon}
            variant="primary"
            onClick={() => loginUser()}
            data-testid="login-github"
          >
            GitHub
          </Button>

          <Button
            leadingVisual={KeyIcon}
            onClick={() => navigate('/login-personal-access-token')}
            data-testid="login-pat"
          >
            Personal Access Token
          </Button>

          <Button
            leadingVisual={PersonIcon}
            onClick={() => navigate('/login-oauth-app')}
            data-testid="login-oauth-app"
          >
            OAuth App
          </Button>
        </Stack>
      </Stack>
    </Centered>
  );
};
