import type { FC } from 'react';

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

import { useAppContext } from '../hooks/useAppContext';
import { useShortcutActions } from '../hooks/useGlobalShortcuts';
import { useFiltersStore } from '../stores';

import { LogoIcon } from './icons/LogoIcon';

export const Sidebar: FC = () => {
  const {
    status,
    isLoggedIn,
    settings,
    notificationCount,
    hasUnreadNotifications,
  } = useAppContext();

  const { shortcuts } = useShortcutActions();

  const hasFilters = useFiltersStore((s) => s.hasActiveFilters());

  const isLoading = status === 'loading';

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
          keybindingHint={shortcuts.home.key}
          onClick={() => shortcuts.home.action()}
          size="small"
          tooltipDirection="e"
          variant="invisible"
        />

        <IconButton
          aria-label="Notifications"
          data-testid="sidebar-notifications"
          description={`${notificationCount} ${settings.fetchReadNotifications ? 'notifications' : 'unread notifications'} ↗`}
          icon={BellIcon}
          keybindingHint={shortcuts.myNotifications.key}
          onClick={() => shortcuts.myNotifications.action()}
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
              keybindingHint={shortcuts.focusedMode.key}
              onClick={() => shortcuts.focusedMode.action()}
              size="small"
              tooltipDirection="e"
              variant={settings.participating ? 'primary' : 'invisible'}
            />

            <IconButton
              aria-label="Filters"
              data-testid="sidebar-filter-notifications"
              description="Filter notifications"
              icon={FilterIcon}
              keybindingHint={shortcuts.filters.key}
              onClick={() => shortcuts.filters.action()}
              size="small"
              tooltipDirection="e"
              variant={hasFilters ? 'primary' : 'invisible'}
            />
          </>
        )}

        <IconButton
          aria-label="My issues ↗"
          data-testid="sidebar-my-issues"
          icon={IssueOpenedIcon}
          keybindingHint={shortcuts.myIssues.key}
          onClick={() => shortcuts.myIssues.action()}
          size="small"
          tooltipDirection="e"
          variant="invisible"
        />

        <IconButton
          aria-label="My pull requests ↗"
          data-testid="sidebar-my-pull-requests"
          icon={GitPullRequestIcon}
          keybindingHint={shortcuts.myPullRequests.key}
          onClick={() => shortcuts.myPullRequests.action()}
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
              disabled={isLoading}
              icon={SyncIcon}
              keybindingHint={shortcuts.refresh.key}
              // loading={status === 'loading'}
              onClick={() => shortcuts.refresh.action()}
              size="small"
              tooltipDirection="e"
              variant="invisible"
            />

            <IconButton
              aria-label="Settings"
              data-testid="sidebar-settings"
              description="Settings"
              icon={GearIcon}
              keybindingHint={shortcuts.settings.key}
              onClick={() => shortcuts.settings.action()}
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
            keybindingHint={shortcuts.quit.key}
            onClick={() => shortcuts.quit.action()}
            size="small"
            tooltipDirection="e"
            variant="invisible"
          />
        )}
      </Stack>
    </Stack>
  );
};
