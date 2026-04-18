import { type FC, type ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ChevronDownIcon,
  ChevronRightIcon,
  KeyIcon,
  MarkGithubIcon,
  PersonIcon,
  ServerIcon,
} from '@primer/octicons-react';
import { Button, Heading, Stack, Text } from '@primer/react';

import { APPLICATION } from '../../shared/constants';

import { useAppContext } from '../hooks/useAppContext';

import { LogoIcon } from '../components/icons/LogoIcon';
import { Centered } from '../components/layout/Centered';

import { Size } from '../types';

import { showWindow } from '../utils/system/comms';

function CollapsibleSection(props: {
  title: string;
  testIdToggle: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-md border border-gitify-notification-border bg-gitify-accounts overflow-hidden">
      <button
        aria-expanded={props.expanded}
        className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-gitify-notification-hover/40"
        data-testid={props.testIdToggle}
        onClick={props.onToggle}
        type="button"
      >
        <Text className="text-sm font-semibold">{props.title}</Text>
        {props.expanded ? (
          <ChevronDownIcon size={16} />
        ) : (
          <ChevronRightIcon size={16} />
        )}
      </button>
      {props.expanded ? (
        <div className="border-t border-gitify-notification-border px-3 pb-3 pt-2">
          {props.children}
        </div>
      ) : null}
    </div>
  );
}

export const LoginRoute: FC = () => {
  const navigate = useNavigate();

  const [githubOpen, setGithubOpen] = useState(false);
  const [giteaOpen, setGiteaOpen] = useState(false);

  const { isLoggedIn } = useAppContext();

  useEffect(() => {
    if (isLoggedIn) {
      showWindow();
      navigate('/', { replace: true });
    }
  }, [isLoggedIn]);

  return (
    <Centered fullHeight={true}>
      <Stack
        align="center"
        className="max-w-md w-full px-2"
        direction="vertical"
        gap="spacious"
      >
        <LogoIcon isDark size={Size.LARGE} />

        <Stack align="center" direction="vertical" gap="condensed">
          <Heading as="h2">{APPLICATION.NAME}</Heading>
          <Text className="text-center max-w-sm" color="fg.muted">
            Notifications from GitHub and Gitea in your menu bar.
          </Text>
        </Stack>

        <Stack
          align="stretch"
          className="w-full"
          direction="vertical"
          gap="condensed"
        >
          <CollapsibleSection
            expanded={githubOpen}
            onToggle={() => setGithubOpen((o) => !o)}
            testIdToggle="login-section-github-toggle"
            title="GitHub"
          >
            <Stack align="stretch" direction="vertical" gap="condensed">
              <Button
                block
                data-testid="login-github"
                leadingVisual={MarkGithubIcon}
                onClick={() => navigate('/login-device-flow')}
                variant="primary"
              >
                Device login
              </Button>

              <Button
                block
                data-testid="login-pat"
                leadingVisual={KeyIcon}
                onClick={() => navigate('/login-personal-access-token')}
              >
                Personal Access Token
              </Button>

              <Button
                block
                data-testid="login-oauth-app"
                leadingVisual={PersonIcon}
                onClick={() => navigate('/login-oauth-app')}
              >
                OAuth App
              </Button>
            </Stack>
          </CollapsibleSection>

          <CollapsibleSection
            expanded={giteaOpen}
            onToggle={() => setGiteaOpen((o) => !o)}
            testIdToggle="login-section-gitea-toggle"
            title="Gitea"
          >
            <Stack align="stretch" direction="vertical" gap="condensed">
              <Button
                block
                data-testid="login-gitea-pat"
                leadingVisual={ServerIcon}
                onClick={() =>
                  navigate('/login-personal-access-token', {
                    state: { forge: 'gitea' as const },
                  })
                }
              >
                Personal Access Token
              </Button>
            </Stack>
          </CollapsibleSection>
        </Stack>
      </Stack>
    </Centered>
  );
};
