import { type FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { KeyIcon, MarkGithubIcon, PersonIcon } from '@primer/octicons-react';
import { Button, Heading, Stack, Text } from '@primer/react';

import { useAppContext } from '../hooks/useAppContext';

import { LogoIcon } from '../components/icons/LogoIcon';
import { Centered } from '../components/layout/Centered';

import { Size } from '../types';

import { showWindow } from '../utils/comms';

export const LoginRoute: FC = () => {
  const navigate = useNavigate();

  const { isLoggedIn } = useAppContext();

  useEffect(() => {
    if (isLoggedIn) {
      showWindow();
      navigate('/', { replace: true });
    }
  }, [isLoggedIn]);

  return (
    <Centered fullHeight={true}>
      <Stack align="center" direction="vertical">
        <LogoIcon isDark size={Size.LARGE} />

        <Stack align="center" gap="none">
          <Heading as="h2">GitHub Notifications</Heading>
          <Heading as="h3">on your menu bar</Heading>
        </Stack>

        <Stack align="center" gap="condensed">
          <Text>Login with</Text>

          <Button
            data-testid="login-github"
            leadingVisual={MarkGithubIcon}
            onClick={() => navigate('/login-device-flow')}
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
