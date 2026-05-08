import { type FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Heading, Stack, Text } from '@primer/react';

import { useAppContext } from '../hooks/useAppContext';

import { LogoIcon } from '../components/icons/LogoIcon';
import { Centered } from '../components/layout/Centered';

import { Size } from '../types';

import { listAdapters } from '../utils/forges/registry';
import { showWindow } from '../utils/system/comms';

export const LoginRoute: FC = () => {
  const navigate = useNavigate();
  const adapters = listAdapters();

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
          <Heading as="h2">Notifications</Heading>
          <Heading as="h3">on your menu bar</Heading>
        </Stack>

        <Stack align="stretch" direction="vertical" gap="normal">
          {adapters.map((adapter) => (
            <Stack
              align="center"
              direction="vertical"
              gap="condensed"
              key={adapter.id}
            >
              <Text>{adapter.displayName}</Text>
              {adapter.loginMethods.map((method) => (
                <Button
                  data-testid={method.testId}
                  key={method.testId}
                  leadingVisual={method.icon}
                  onClick={() =>
                    method.state
                      ? navigate(method.route, { state: method.state })
                      : navigate(method.route)
                  }
                  variant={method.variant}
                >
                  {method.label}
                </Button>
              ))}
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Centered>
  );
};
