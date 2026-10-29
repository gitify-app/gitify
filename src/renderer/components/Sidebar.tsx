import { useTranslation } from 'react-i18next';

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

import { useNotifications } from '../hooks/useNotifications';
import { useShortcutActions } from '../hooks/useShortcutActions';
import { useAccountsStore, useFiltersStore, useSettingsStore } from '../stores';

import { LogoIcon } from '../icons/LogoIcon';

export function Sidebar() {
  const { t } = useTranslation();
  const { status, notificationCount, hasUnreadNotifications, isFetching } = useNotifications();

  const { shortcuts } = useShortcutActions();

  const isLoggedIn = useAccountsStore((s) => s.isLoggedIn());

  const hasFilters = useFiltersStore((s) => s.hasActiveFilters());

  const fetchReadNotifications = useSettingsStore((s) => s.fetchReadNotifications);
  const participating = useSettingsStore((s) => s.participating);

  const isLoading = status === 'loading';

  return (
    <Stack
      className="gitify-sidebar fixed w-sidebar h-full bg-gitify-sidebar [&_svg]:text-white"
      direction="vertical"
      justify="space-between"
    >
      <Stack align="center" direction="vertical" gap="condensed" padding="normal">
        <IconButton
          aria-label={APPLICATION.NAME}
          description={t('sidebar.home', 'Home')}
          icon={<LogoIcon />}
          keybindingHint={shortcuts.home.key}
          onClick={() => shortcuts.home.action()}
          size="small"
          tooltipDirection="e"
          variant="invisible"
        />

        {isLoggedIn && (
          <>
            <IconButton
              aria-label={t('sidebar.notifications', 'Notifications')}
              description={
                fetchReadNotifications
                  ? t('sidebar.notifications_count', '{{count}} notifications ↗', {
                      count: notificationCount,
                    })
                  : t('sidebar.unread_notifications_count', '{{count}} unread notifications ↗', {
                      count: notificationCount,
                    })
              }
              icon={BellIcon}
              keybindingHint={shortcuts.myNotifications.key}
              onClick={() => shortcuts.myNotifications.action()}
              size="small"
              tooltipDirection="e"
              variant={hasUnreadNotifications ? 'primary' : 'invisible'}
            />

            <IconButton
              aria-label={t('sidebar.focused_mode', 'Toggle focused mode')}
              description={
                participating
                  ? t('sidebar.focused', 'Focused (participating only)')
                  : t('sidebar.participating_watching', 'Participating and watching')
              }
              icon={participating ? CrosshairsIcon : EyeIcon}
              keybindingHint={shortcuts.focusedMode.key}
              onClick={() => shortcuts.focusedMode.action()}
              size="small"
              tooltipDirection="e"
              variant={participating ? 'primary' : 'invisible'}
            />

            <IconButton
              aria-label={t('sidebar.filters', 'Filters')}
              description={t('sidebar.filter_notifications', 'Filter notifications')}
              icon={FilterIcon}
              keybindingHint={shortcuts.filters.key}
              onClick={() => shortcuts.filters.action()}
              size="small"
              tooltipDirection="e"
              variant={hasFilters ? 'primary' : 'invisible'}
            />

            <IconButton
              aria-label={t('sidebar.my_issues', 'My issues ↗')}
              icon={IssueOpenedIcon}
              keybindingHint={shortcuts.myIssues.key}
              onClick={() => shortcuts.myIssues.action()}
              size="small"
              tooltipDirection="e"
              variant="invisible"
            />

            <IconButton
              aria-label={t('sidebar.my_pull_requests', 'My pull requests ↗')}
              icon={GitPullRequestIcon}
              keybindingHint={shortcuts.myPullRequests.key}
              onClick={() => shortcuts.myPullRequests.action()}
              size="small"
              tooltipDirection="e"
              variant="invisible"
            />
          </>
        )}
      </Stack>

      <Stack align="center" direction="vertical" gap="condensed" padding="normal">
        {isLoggedIn && (
          <>
            <IconButton
              aria-label={t('sidebar.refresh', 'Refresh')}
              description={t('sidebar.refresh_notifications', 'Refresh notifications')}
              loading={isLoading || isFetching}
              disabled={isLoading || isFetching}
              icon={SyncIcon}
              keybindingHint={shortcuts.refresh.key}
              onClick={() => shortcuts.refresh.action()}
              size="small"
              tooltipDirection="e"
              variant="invisible"
            />

            <IconButton
              aria-label={t('sidebar.settings', 'Settings')}
              description={t('settings.title', 'Settings')}
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
            aria-label={t('settings.footer.quit', 'Quit {{appName}}', {
              appName: APPLICATION.NAME,
            })}
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
}
