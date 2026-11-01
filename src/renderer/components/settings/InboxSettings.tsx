import type { MouseEvent } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
  CheckIcon,
  CommentIcon,
  DashIcon,
  DownloadIcon,
  GitCommitIcon,
  GitPullRequestIcon,
  InboxIcon,
  IssueOpenedIcon,
  ListUnorderedIcon,
  MarkGithubIcon,
  MilestoneIcon,
  PlusIcon,
  ReleaseIcon,
  SmileyIcon,
  SyncIcon,
  TagIcon,
} from '@primer/octicons-react';
import { Banner, Button, ButtonGroup, IconButton, Stack, Text } from '@primer/react';

import { formatDuration } from 'date-fns/formatDuration';
import { millisecondsToMinutes } from 'date-fns/millisecondsToMinutes';

import { APPLICATION } from '../../../shared/constants';

import { Constants } from '../../constants';

import { useAppNavigate } from '../../hooks/useAppNavigate';
import { useAccountsStore, useSettingsStore } from '../../stores';

import { SectionHeading } from '../primitives/SectionHeading';

import { GroupBy, Size } from '../../types';

import { isMarkAsDoneFeatureSupported } from '../../utils/api/features';
import { hasAlternateScopes, hasRecommendedScopes } from '../../utils/auth/scopes';
import { openGitHubParticipatingDocs } from '../../utils/system/links';
import { SettingsChoice } from './controls/SettingsChoice';
import { SettingsList } from './controls/SettingsList';
import { SettingsReveal } from './controls/SettingsReveal';
import { SettingsRow } from './controls/SettingsRow';
import { SettingsToggle } from './controls/SettingsToggle';
import { SettingsGroupHeading } from './SettingsGroupHeading';

export function InboxSettings() {
  const { t } = useTranslation();
  const navigate = useAppNavigate();

  // Account store values
  const accounts = useAccountsStore((s) => s.accounts);
  const hasMultipleAccounts = useAccountsStore((s) => s.hasMultipleAccounts());
  const hasGitHubAccount = accounts.some((account) => account.forge === 'github');
  const hasMarkAsDoneAccount = accounts.some(isMarkAsDoneFeatureSupported);

  // Setting store actions
  const toggleSetting = useSettingsStore((s) => s.toggleSetting);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  // Setting store values
  const fetchInterval = useSettingsStore((s) => s.fetchInterval);
  const fetchAllNotifications = useSettingsStore((s) => s.fetchAllNotifications);
  const fetchReadNotifications = useSettingsStore((s) => s.fetchReadNotifications);
  const participating = useSettingsStore((s) => s.participating);
  const detailedNotifications = useSettingsStore((s) => s.detailedNotifications);
  const showPills = useSettingsStore((s) => s.showPills);
  const showNumber = useSettingsStore((s) => s.showNumber);
  const groupBy = useSettingsStore((s) => s.groupBy);
  const showAccountHeader = useSettingsStore((s) => s.showAccountHeader);
  const wrapNotificationTitle = useSettingsStore((s) => s.wrapNotificationTitle);
  const markAsDoneOnOpen = useSettingsStore((s) => s.markAsDoneOnOpen);
  const markAsDoneOnUnsubscribe = useSettingsStore((s) => s.markAsDoneOnUnsubscribe);
  const delayNotificationState = useSettingsStore((s) => s.delayNotificationState);

  return (
    <fieldset>
      <SectionHeading as="legend" icon={InboxIcon}>
        {t('settings.inbox.title', 'Inbox')}
      </SectionHeading>

      <div>
        <SettingsGroupHeading icon={DownloadIcon}>
          {t('settings.inbox.group_fetch', 'Fetch')}
        </SettingsGroupHeading>

        <SettingsList>
          <SettingsRow
            label={t('settings.inbox.fetch_interval', 'Fetch interval')}
            name="fetchInterval"
            tooltip={t(
              'settings.inbox.fetch_interval_help',
              'Check for new notifications at this interval. Shorter intervals keep the list fresher but spend more API requests.',
            )}
          >
            <ButtonGroup>
              <IconButton
                aria-label={t(
                  'settings.notifications.fetch_interval_decrease',
                  'Decrease fetch interval',
                )}
                icon={DashIcon}
                onClick={() => {
                  const newInterval = Math.max(
                    fetchInterval - Constants.FETCH_NOTIFICATIONS_INTERVAL_STEP_MS,
                    Constants.MIN_FETCH_NOTIFICATIONS_INTERVAL_MS,
                  );

                  if (newInterval !== fetchInterval) {
                    updateSetting('fetchInterval', newInterval);
                  }
                }}
                size="small"
                unsafeDisableTooltip={true}
              />

              <Button
                aria-label={t('settings.notifications.fetch_interval_display', 'Fetch interval')}
                className="pointer-events-none"
                size="small"
                tabIndex={-1}
              >
                {formatDuration({
                  minutes: millisecondsToMinutes(fetchInterval),
                })}
              </Button>

              <IconButton
                aria-label={t(
                  'settings.notifications.fetch_interval_increase',
                  'Increase fetch interval',
                )}
                icon={PlusIcon}
                onClick={() => {
                  const newInterval = Math.min(
                    fetchInterval + Constants.FETCH_NOTIFICATIONS_INTERVAL_STEP_MS,
                    Constants.MAX_FETCH_NOTIFICATIONS_INTERVAL_MS,
                  );

                  if (newInterval !== fetchInterval) {
                    updateSetting('fetchInterval', newInterval);
                  }
                }}
                size="small"
                unsafeDisableTooltip={true}
              />

              <IconButton
                aria-label={t(
                  'settings.notifications.fetch_interval_reset',
                  'Reset fetch interval',
                )}
                icon={SyncIcon}
                onClick={() => {
                  updateSetting('fetchInterval', Constants.DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS);
                }}
                size="small"
                unsafeDisableTooltip={true}
                variant="danger"
              />
            </ButtonGroup>
          </SettingsRow>

          <SettingsToggle
            checked={fetchAllNotifications}
            label={t('settings.inbox.fetch_all', 'Fetch all notifications')}
            name="fetchAllNotifications"
            onChange={() => toggleSetting('fetchAllNotifications')}
            tooltip={
              <Stack direction="vertical" gap="condensed">
                <Text>
                  {t(
                    'settings.inbox.fetch_all_help',
                    'When checked, fetch all notifications from your inbox.',
                  )}
                </Text>
                <Text>
                  {t(
                    'settings.inbox.fetch_all_help_unchecked',
                    'When unchecked, fetch only the first page of notifications.',
                  )}
                </Text>
              </Stack>
            }
          />

          <SettingsToggle
            checked={fetchReadNotifications}
            label={t('settings.inbox.fetch_read', 'Fetch read and done notifications')}
            name="fetchReadNotifications"
            onChange={() => toggleSetting('fetchReadNotifications')}
            tooltip={
              <Stack direction="vertical" gap="condensed">
                <Text>
                  {t(
                    'settings.inbox.fetch_read_help',
                    'Fetch all notifications including read and done.',
                  )}
                </Text>
                <Text className="text-gitify-caution">
                  {t(
                    'settings.inbox.fetch_read_done_caution',
                    "GitHub's API does not distinguish between read and done states, so Mark as done actions are unavailable while this is enabled.",
                  )}
                </Text>
                <Text className="text-gitify-caution">
                  {t(
                    'settings.inbox.fetch_read_rate_caution',
                    'This increases API usage and may cause rate limiting for users with many notifications.',
                  )}
                </Text>
              </Stack>
            }
          />
        </SettingsList>

        <SettingsGroupHeading icon={ListUnorderedIcon}>
          {t('settings.inbox.group_list', 'List')}
        </SettingsGroupHeading>

        <SettingsList>
          <SettingsChoice
            label={t('settings.inbox.group_by', 'Group by')}
            name="groupBy"
            onChange={(value) => updateSetting('groupBy', value as GroupBy)}
            options={[
              {
                label: t('settings.inbox.group_by_repository', 'Repository'),
                value: GroupBy.REPOSITORY,
              },
              { label: t('settings.inbox.group_by_date', 'Date'), value: GroupBy.DATE },
            ]}
            tooltip={
              <Stack direction="vertical" gap="condensed">
                <Text>
                  {t(
                    'settings.inbox.group_by_help',
                    'Choose how notifications are displayed in the list.',
                  )}
                </Text>
                <Text>
                  <Trans
                    i18nKey="settings.inbox.group_by_repository_help"
                    components={[<Text as="strong" key={0} />]}
                    defaults="<0>Repository</0> groups notifications by repository name."
                  />
                </Text>
                <Text>
                  <Trans
                    i18nKey="settings.inbox.group_by_date_help"
                    components={[<Text as="strong" key={0} />]}
                    defaults="<0>Date</0> shows notifications in chronological order."
                  />
                </Text>
              </Stack>
            }
            value={groupBy}
          />

          <SettingsToggle
            checked={showAccountHeader}
            label={t('settings.inbox.show_account_header', 'Show account header')}
            name="showAccountHeader"
            onChange={() => toggleSetting('showAccountHeader')}
            tooltip={t(
              'settings.inbox.show_account_header_help',
              'Show your avatar, username, and quick links above the notifications list.',
            )}
            visible={!hasMultipleAccounts}
          />

          <SettingsToggle
            checked={wrapNotificationTitle}
            label={t('settings.inbox.wrap_notification_title', 'Show full notification title')}
            name="wrapNotificationTitle"
            onChange={() => toggleSetting('wrapNotificationTitle')}
            tooltip={t(
              'settings.inbox.wrap_notification_title_help',
              'Wrap long notification titles onto multiple lines instead of truncating them.',
            )}
          />

          <SettingsToggle
            checked={showNumber}
            label={t('settings.inbox.show_reference', 'Show reference')}
            name="showNumber"
            onChange={() => toggleSetting('showNumber')}
            tooltip={
              <Stack direction="vertical" gap="condensed">
                <Text>
                  {t('settings.inbox.show_reference_help', 'Show the reference where available:')}
                </Text>
                <div className="pl-2">
                  <Stack direction="vertical" gap="none">
                    <Stack align="center" direction="horizontal" gap="condensed">
                      <CommentIcon size={Size.SMALL} />
                      <Text>{t('settings.inbox.reference_discussion', 'Discussion')}</Text>
                      <Text className="text-gitify-icon-muted">#123</Text>
                    </Stack>
                    <Stack align="center" direction="horizontal" gap="condensed">
                      <IssueOpenedIcon size={Size.SMALL} />
                      <Text>{t('settings.inbox.reference_issue', 'Issue')}</Text>
                      <Text className="text-gitify-icon-muted">#123</Text>
                    </Stack>
                    <Stack align="center" direction="horizontal" gap="condensed">
                      <GitPullRequestIcon size={Size.SMALL} />
                      <Text>{t('settings.inbox.reference_pull_request', 'Pull request')}</Text>
                      <Text className="text-gitify-icon-muted">#123</Text>
                    </Stack>
                    <Stack align="center" direction="horizontal" gap="condensed">
                      <GitCommitIcon size={Size.SMALL} />
                      <Text>{t('settings.inbox.reference_commit', 'Commit')}</Text>
                      <Text className="text-gitify-icon-muted">a1b2c3d</Text>
                    </Stack>
                    <Stack align="center" direction="horizontal" gap="condensed">
                      <ReleaseIcon size={Size.SMALL} />
                      <Text>{t('settings.inbox.reference_release', 'Release')}</Text>
                      <Text className="text-gitify-icon-muted">v1.2.3</Text>
                    </Stack>
                  </Stack>
                </div>
              </Stack>
            }
          />

          <SettingsToggle
            checked={delayNotificationState}
            label={t('settings.inbox.delay_state', 'Delay notification removal')}
            name="delayNotificationState"
            onChange={() => toggleSetting('delayNotificationState')}
            tooltip={t(
              'settings.inbox.delay_state_help',
              'Keep the notification in {{appName}} after interacting with it until the next refresh window.',
              { appName: APPLICATION.NAME },
            )}
          />
        </SettingsList>

        {hasGitHubAccount ? (
          <>
            <SettingsGroupHeading icon={MarkGithubIcon}>
              {t('settings.inbox.group_github', 'GitHub')}
            </SettingsGroupHeading>

            <SettingsList>
              <SettingsToggle
                checked={participating}
                label={t('settings.inbox.participating', 'Fetch only participating')}
                name="showOnlyParticipating"
                onChange={() => toggleSetting('participating')}
                tooltip={
                  <Stack direction="vertical" gap="condensed">
                    <Text>
                      {t(
                        'settings.inbox.participating_help',
                        'When checked, fetch only participating notifications.',
                      )}
                    </Text>
                    <Text>
                      {t(
                        'settings.inbox.participating_help_unchecked',
                        'When unchecked, fetch participating and watching notifications.',
                      )}
                    </Text>
                    <button
                      className="text-gitify-link cursor-pointer"
                      onClick={(event: MouseEvent<HTMLElement>) => {
                        event.stopPropagation();
                        openGitHubParticipatingDocs();
                      }}
                      title={t(
                        'settings.notifications.participating_docs_title',
                        'Open GitHub documentation for participating and watching notifications',
                      )}
                      type="button"
                    >
                      {t('settings.inbox.learn_more', 'Learn more')}
                    </button>
                  </Stack>
                }
              />

              <SettingsToggle
                checked={detailedNotifications}
                label={t('settings.inbox.fetch_detailed', 'Fetch detailed notifications')}
                name="detailedNotifications"
                onChange={() => toggleSetting('detailedNotifications')}
                tooltip={
                  <Stack direction="vertical" gap="condensed">
                    <Text>
                      {t(
                        'settings.inbox.fetch_detailed_help',
                        'Enrich notifications with detailed user and state information. You may also choose to display notification metrics.',
                      )}
                    </Text>
                    <Text className="text-gitify-caution">
                      {t(
                        'settings.inbox.fetch_detailed_caution',
                        'Users with a large number of unread notifications may experience rate limiting.',
                      )}
                    </Text>
                  </Stack>
                }
              />

              {detailedNotifications &&
                accounts.some(
                  (account) =>
                    account.forge === 'github' &&
                    !hasRecommendedScopes(account) &&
                    !hasAlternateScopes(account),
                ) && (
                  <Banner
                    data-testid="settings-scope-warning"
                    description={
                      <Stack direction="vertical" gap="condensed">
                        <Text>
                          {t(
                            'settings.inbox.scope_warning',
                            'One or more accounts are missing scopes required for notification enrichment. Notification details may be incomplete.',
                          )}
                        </Text>
                        <Button onClick={() => navigate('/accounts')} size="small">
                          {t('settings.inbox.review_account_scopes', 'Review account scopes')}
                        </Button>
                      </Stack>
                    }
                    title={t('settings.inbox.scope_warning_title', 'Missing notification scopes')}
                    variant="warning"
                  />
                )}

              <SettingsReveal name="notificationMetrics" open={detailedNotifications}>
                <div>
                  <SettingsToggle
                    checked={showPills}
                    label={t('settings.inbox.show_metrics', 'Show notification metrics')}
                    name="showPills"
                    onChange={() => toggleSetting('showPills')}
                    tooltip={
                      <Stack direction="vertical" gap="condensed">
                        <Text>
                          {t('settings.inbox.show_metrics_help', 'Show notification metrics for:')}
                        </Text>
                        <div className="pl-2">
                          <Stack direction="vertical" gap="none">
                            <Stack direction="horizontal" gap="condensed">
                              <IssueOpenedIcon size={Size.SMALL} />
                              {t('settings.notifications.pill_linked_issues', 'linked issues')}
                            </Stack>
                            <Stack direction="horizontal" gap="condensed">
                              <SmileyIcon size={Size.SMALL} />
                              {t('settings.notifications.pill_reactions', 'reactions')}
                            </Stack>
                            <Stack direction="horizontal" gap="condensed">
                              <CheckIcon size={Size.SMALL} />
                              {t('settings.notifications.pill_pr_reviews', 'pull request reviews')}
                            </Stack>
                            <Stack direction="horizontal" gap="condensed">
                              <CommentIcon size={Size.SMALL} />
                              {t('settings.notifications.pill_comments', 'comments')}
                            </Stack>
                            <Stack direction="horizontal" gap="condensed">
                              <TagIcon size={Size.SMALL} />
                              {t('settings.notifications.pill_labels', 'labels')}
                            </Stack>
                            <Stack direction="horizontal" gap="condensed">
                              <MilestoneIcon size={Size.SMALL} />
                              {t('settings.notifications.pill_milestones', 'milestones')}
                            </Stack>
                          </Stack>
                        </div>
                      </Stack>
                    }
                  />
                </div>
              </SettingsReveal>

              <SettingsToggle
                caption={
                  !hasMarkAsDoneAccount
                    ? t(
                        'settings.inbox.mark_done_caption',
                        'Requires GitHub Cloud or GitHub Enterprise Server 3.13 or later.',
                      )
                    : undefined
                }
                checked={markAsDoneOnOpen}
                disabled={!hasMarkAsDoneAccount}
                label={t('settings.inbox.mark_done_open', 'Mark as done on open')}
                name="markAsDoneOnOpen"
                onChange={() => toggleSetting('markAsDoneOnOpen')}
                tooltip={t(
                  'settings.inbox.mark_done_help',
                  'Mark as done is supported by GitHub Cloud and GitHub Enterprise Server 3.13 or later.',
                )}
              />

              <SettingsToggle
                caption={
                  !hasMarkAsDoneAccount
                    ? t(
                        'settings.inbox.mark_done_caption',
                        'Requires GitHub Cloud or GitHub Enterprise Server 3.13 or later.',
                      )
                    : undefined
                }
                checked={markAsDoneOnUnsubscribe}
                disabled={!hasMarkAsDoneAccount}
                label={t('settings.inbox.mark_done_unsubscribe', 'Mark as done on unsubscribe')}
                name="markAsDoneOnUnsubscribe"
                onChange={() => toggleSetting('markAsDoneOnUnsubscribe')}
                tooltip={t(
                  'settings.inbox.mark_done_help',
                  'Mark as done is supported by GitHub Cloud and GitHub Enterprise Server 3.13 or later.',
                )}
              />
            </SettingsList>
          </>
        ) : (
          <Text className="text-xs text-gitify-icon-muted">
            {t(
              'settings.inbox.github_requires_account',
              'GitHub-specific options require a GitHub account.',
            )}
          </Text>
        )}
      </div>
    </fieldset>
  );
}
