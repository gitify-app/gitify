import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';

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
import { getNavItem } from '../nav';

/**
 * Primer styles a link-rendered button as `inline-flex`, which squeezes the
 * icon into the button's content box. Keep the icon-button grid so icons keep
 * their intrinsic size.
 */
const NAV_LINK_STYLE = { display: 'inline-grid' } as const;

export function Sidebar() {
  const { t } = useTranslation();
  const { status, notificationCount, hasUnreadNotifications, isFetching } = useNotifications();

  const { shortcuts } = useShortcutActions();

  const isLoggedIn = useAccountsStore((s) => s.isLoggedIn());

  const hasFilters = useFiltersStore((s) => s.hasActiveFilters());

  const fetchReadNotifications = useSettingsStore((s) => s.fetchReadNotifications);
  const participating = useSettingsStore((s) => s.participating);

  const isLoading = status === 'loading';

  const home = getNavItem('home');
  const filters = getNavItem('filters');
  const settings = getNavItem('settings');

  // Literal t() keys keep the labels discoverable by the i18n extractor.
  const copy = {
    filters: {
      label: t('sidebar.filters', 'Filters'),
      description: t('sidebar.filter_notifications', 'Filter notifications'),
    },
    home: {
      description: t('sidebar.home', 'Home'),
    },
    settings: {
      label: t('sidebar.settings', 'Settings'),
      description: t('settings.title', 'Settings'),
    },
  };

  /**
   * Keep the existing toggle behavior for a destination that is already shown,
   * while letting modified clicks use the link's native navigation.
   */
  const navigateFromControl = (event: MouseEvent<HTMLElement>, action: () => void) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    action();
  };

  return (
    <Stack
      className="gitify-sidebar fixed w-sidebar h-full bg-gitify-sidebar [&_svg]:text-white"
      direction="vertical"
      justify="space-between"
    >
      <Stack align="center" direction="vertical" gap="condensed" padding="normal">
        <IconButton
          aria-label={APPLICATION.NAME}
          as={NavLink}
          description={copy.home.description}
          end={home.exact}
          icon={<LogoIcon />}
          keybindingHint={shortcuts.home.key}
          onClick={(event) => navigateFromControl(event, shortcuts.home.action)}
          size="small"
          style={NAV_LINK_STYLE}
          to={home.path}
          tooltipDirection="e"
          type={undefined}
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
              aria-label={copy.filters.label}
              as={NavLink}
              description={copy.filters.description}
              icon={FilterIcon}
              keybindingHint={shortcuts.filters.key}
              onClick={(event) => navigateFromControl(event, shortcuts.filters.action)}
              size="small"
              style={NAV_LINK_STYLE}
              to={filters.path}
              tooltipDirection="e"
              type={undefined}
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
              aria-label={copy.settings.label}
              as={NavLink}
              description={copy.settings.description}
              icon={GearIcon}
              keybindingHint={shortcuts.settings.key}
              onClick={(event) => navigateFromControl(event, shortcuts.settings.action)}
              size="small"
              style={NAV_LINK_STYLE}
              to={settings.path}
              tooltipDirection="e"
              type={undefined}
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
