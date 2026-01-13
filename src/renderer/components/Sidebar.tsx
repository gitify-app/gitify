import type { FC } from 'react';

// import { useLocation, useNavigate } from 'react-router-dom';

// import { useLocation, useNavigate } from 'react-router-dom';

import {
  BellIcon,
  CrosshairsIcon,
  EyeIcon,
  FilterIcon,
  GearIcon,
  GitPullRequestIcon,
  IssueOpenedIcon,
  SyncIcon,
  XCircleIcon,
} from '@primer/octicons-react';
import { IconButton, Stack } from '@primer/react';

import { APPLICATION } from '../../shared/constants';

import { useAppContext } from '../context/App';
import { useShortcutActions } from '../hooks/useShortcutActions';
import { getPrimaryAccountHostname } from '../utils/auth/utils';
import { quitApp } from '../utils/comms';
import {
  openGitHubIssues,
  openGitHubNotifications,
  openGitHubPulls,
} from '../utils/links';
import { hasActiveFilters } from '../utils/notifications/filters/filter';
import { LogoIcon } from './icons/LogoIcon';

export const Sidebar: FC = () => {
  const {
    status,
    isLoggedIn,
    settings,
    auth,
    notificationCount,
    hasUnreadNotifications,
  } = useAppContext();

  const primaryAccountHostname = getPrimaryAccountHostname(auth);

  const { actions, hotkeys, enabled } = useShortcutActions();

  return (
    <Stack
      className="fixed w-sidebar h-full bg-gitify-sidebar [&_svg]:text-white"
      direction="vertical"
      justify="space-between"
    >
      <Stack
        align="center"
        direction="vertical"
        gap="condensed"
        padding="normal"
      >
        <IconButton
          aria-label={APPLICATION.NAME}
          data-testid="sidebar-home"
          description="Home"
          icon={LogoIcon}
          keybindingHint={hotkeys.home}
          onClick={() => actions.home()}
          size="small"
          tooltipDirection="e"
          variant="invisible"
        />

        <IconButton
          aria-label="Notifications"
          data-testid="sidebar-notifications"
          description={`${notificationCount} ${settings.fetchReadNotifications ? 'notifications' : 'unread notifications'} ↗`}
          icon={BellIcon}
          onClick={() => openGitHubNotifications(primaryAccountHostname)}
          size="small"
          tooltipDirection="e"
          variant={hasUnreadNotifications ? 'primary' : 'invisible'}
        />

        {isLoggedIn && (
          <>
            <IconButton
              aria-label="Toggle focused mode"
              data-testid="sidebar-focused-mode"
              description={
                settings.participating
                  ? 'Focused (participating only)'
                  : 'Participating and watching'
              }
              icon={settings.participating ? CrosshairsIcon : EyeIcon}
              keybindingHint={hotkeys.focusedMode}
              onClick={() => actions.focusedMode()}
              size="small"
              tooltipDirection="e"
              variant={settings.participating ? 'primary' : 'invisible'}
            />

            <IconButton
              aria-label="Filters"
              data-testid="sidebar-filter-notifications"
              description="Filter notifications"
              icon={FilterIcon}
              keybindingHint={hotkeys.filters}
              onClick={() => actions.filters()}
              size="small"
              tooltipDirection="e"
              variant={hasActiveFilters(settings) ? 'primary' : 'invisible'}
            />
          </>
        )}

        <IconButton
          aria-label="My issues ↗"
          data-testid="sidebar-my-issues"
          icon={IssueOpenedIcon}
          onClick={() => openGitHubIssues(primaryAccountHostname)}
          size="small"
          tooltipDirection="e"
          variant="invisible"
        />

        <IconButton
          aria-label="My pull requests ↗"
          data-testid="sidebar-my-pull-requests"
          icon={GitPullRequestIcon}
          onClick={() => openGitHubPulls(primaryAccountHostname)}
          size="small"
          tooltipDirection="e"
          variant="invisible"
        />
      </Stack>

      <Stack
        align="center"
        direction="vertical"
        gap="condensed"
        padding="normal"
      >
        {isLoggedIn && (
          <>
            <IconButton
              aria-label="Refresh"
              className={status === 'loading' ? 'animate-spin' : ''}
              data-testid="sidebar-refresh"
              description="Refresh notifications"
              disabled={!enabled.refresh}
              icon={SyncIcon}
              keybindingHint={hotkeys.refresh}
              // loading={status === 'loading'}
              onClick={() => actions.refresh()}
              size="small"
              tooltipDirection="e"
              variant="invisible"
            />

            <IconButton
              aria-label="Settings"
              data-testid="sidebar-settings"
              description="Settings"
              icon={GearIcon}
              keybindingHint={hotkeys.settings}
              onClick={() => actions.settings()}
              size="small"
              tooltipDirection="e"
              variant="invisible"
            />
          </>
        )}

        {!isLoggedIn && (
          <IconButton
            aria-label={`Quit ${APPLICATION.NAME}`}
            data-testid="sidebar-quit"
            icon={XCircleIcon}
            keybindingHint={hotkeys.quit}
            onClick={() => quitApp()}
            size="small"
            tooltipDirection="e"
            variant="invisible"
          />
        )}
      </Stack>
    </Stack>
  );
};
