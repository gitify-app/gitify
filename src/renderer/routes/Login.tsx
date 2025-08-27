import { type FC, useCallback, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { KeyIcon, MarkGithubIcon, PersonIcon } from '@primer/octicons-react';
import { Button, Heading, Stack, Text } from '@primer/react';

import { LogoIcon } from '../components/icons/LogoIcon';
import { Centered } from '../components/layout/Centered';
import { AppContext } from '../context/App';
import { Size } from '../types';
import { showWindow } from '../utils/comms';
import { rendererLogError } from '../utils/logger';

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
      rendererLogError(
        'loginWithGitHubApp',
        'failed to login with GitHub',
        err,
      );
    }
  }, [loginWithGitHubApp]);

  return (
    <Centered fullHeight={true}>
      <Stack align="center" direction="vertical">
        <LogoIcon isDark size={Size.LARGE} />

        <Stack align="center" gap="none">
          <Heading sx={{ fontSize: 4 }}>GitHub Notifications</Heading>
          <Heading sx={{ fontSize: 3 }}>on your menu bar</Heading>
        </Stack>

        <Stack align="center" gap="condensed">
          <Text>Login with</Text>

          <Button
            data-testid="login-github"
            leadingVisual={MarkGithubIcon}
            onClick={() => loginUser()}
            variant="primary"
          >
            GitHub
          </Button>

          <Button
            data-testid="login-pat"
            leadingVisual={KeyIcon}
            onClick={() => navigate('/login-personal-access-token')}
          >
            Personal Access Token
          </Button>

          <Button
            data-testid="login-oauth-app"
            leadingVisual={PersonIcon}
            onClick={() => navigate('/login-oauth-app')}
          >
            OAuth App
          </Button>
        </Stack>
      </Stack>
    </Centered>
  );
};
