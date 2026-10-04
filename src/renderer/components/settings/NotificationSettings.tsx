import type { FC, MouseEvent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import {
  AlertFillIcon,
  BellIcon,
  CheckIcon,
  CommentIcon,
  DashIcon,
  GitPullRequestIcon,
  IssueOpenedIcon,
  MilestoneIcon,
  PlusIcon,
  SmileyIcon,
  SyncIcon,
  TagIcon,
} from '@primer/octicons-react';
import { Button, ButtonGroup, IconButton, Stack, Text } from '@primer/react';

import { formatDuration } from 'date-fns/formatDuration';
import { millisecondsToMinutes } from 'date-fns/millisecondsToMinutes';

import { APPLICATION } from '../../../shared/constants';

import { Constants } from '../../constants';

import { useAccountsStore, useSettingsStore } from '../../stores';

import { Checkbox } from '../fields/Checkbox';
import { FieldLabel } from '../fields/FieldLabel';
import { RadioGroup } from '../fields/RadioGroup';
import { Title } from '../primitives/Title';

import { GroupBy, Size } from '../../types';

import { hasAlternateScopes, hasRecommendedScopes } from '../../utils/auth/scopes';
import { openGitHubParticipatingDocs } from '../../utils/system/links';

export const NotificationSettings: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Account store values
  const accounts = useAccountsStore((s) => s.accounts);

  // Setting store actions
  const toggleSetting = useSettingsStore((s) => s.toggleSetting);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  // Setting store values
  const groupBy = useSettingsStore((s) => s.groupBy);
  const fetchInterval = useSettingsStore((s) => s.fetchInterval);
  const fetchAllNotifications = useSettingsStore((s) => s.fetchAllNotifications);
  const detailedNotifications = useSettingsStore((s) => s.detailedNotifications);
  const showPills = useSettingsStore((s) => s.showPills);
  const showNumber = useSettingsStore((s) => s.showNumber);
  const participating = useSettingsStore((s) => s.participating);
  const fetchReadNotifications = useSettingsStore((s) => s.fetchReadNotifications);
  const markAsDoneOnOpen = useSettingsStore((s) => s.markAsDoneOnOpen);
  const markAsDoneOnUnsubscribe = useSettingsStore((s) => s.markAsDoneOnUnsubscribe);
  const delayNotificationState = useSettingsStore((s) => s.delayNotificationState);

  return (
    <fieldset>
      <Title icon={BellIcon}>{t('settings.notifications.title', 'Notifications')}</Title>

      <Stack direction="vertical" gap="condensed">
        <RadioGroup
          label={t('settings.notifications.group_by', 'Group by:')}
          name="groupBy"
          onChange={(evt) => {
            updateSetting('groupBy', evt.target.value as GroupBy);
          }}
          options={[
            {
              label: t('settings.notifications.group_by_repository', 'Repository'),
              value: GroupBy.REPOSITORY,
            },
            { label: t('settings.notifications.group_by_date', 'Date'), value: GroupBy.DATE },
          ]}
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Trans
                i18nKey="settings.notifications.group_by_help"
                components={[<Text as="strong" key={0} />, <Text as="strong" key={1} />]}
                defaults="Choose how notifications are displayed in the list. <0>Repository</0> groups notifications by their repository full name. <1>Date</1> shows notifications in chronological order."
              />
            </Stack>
          }
          value={groupBy}
        />

        <Stack align="center" className="text-sm" direction="horizontal" gap="condensed">
          <FieldLabel
            label={t('settings.notifications.fetch_interval', 'Fetch interval:')}
            name="fetchInterval"
          />

          <ButtonGroup className="ml-2">
            <IconButton
              aria-label={t(
                'settings.notifications.fetch_interval_decrease',
                'Decrease fetch interval',
              )}
              data-testid="settings-fetch-interval-decrease"
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
              data-testid="settings-fetch-interval-increase"
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
              aria-label={t('settings.notifications.fetch_interval_reset', 'Reset fetch interval')}
              data-testid="settings-fetch-interval-reset"
              icon={SyncIcon}
              onClick={() => {
                updateSetting('fetchInterval', Constants.DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS);
              }}
              size="small"
              unsafeDisableTooltip={true}
              variant="danger"
            />
          </ButtonGroup>
        </Stack>

        <Checkbox
          checked={fetchAllNotifications}
          label={t('settings.notifications.fetch_all', 'Fetch all notifications')}
          name="fetchAllNotifications"
          onChange={() => toggleSetting('fetchAllNotifications')}
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Trans
                i18nKey="settings.notifications.fetch_all_help"
                components={[
                  <Text as="u" key={0} />,
                  <Text as="strong" key={1} />,
                  <Text as="u" key={2} />,
                ]}
                defaults="When <0>checked</0>, {{appName}} will fetch <1>all</1> notifications from your inbox. When <2>unchecked</2>, {{appName}} will fetch the first page of notifications (max 50 records per GitHub account)"
                values={{ appName: APPLICATION.NAME }}
              />
            </Stack>
          }
        />

        <Checkbox
          checked={detailedNotifications}
          label={t('settings.notifications.fetch_detailed', 'Fetch detailed notifications')}
          name="detailedNotifications"
          onChange={() => toggleSetting('detailedNotifications')}
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Trans
                i18nKey="settings.notifications.fetch_detailed_help"
                components={[
                  <Text as="u" key={0} />,
                  <Text as="strong" key={1} />,
                  <Text as="strong" key={2} />,
                  <Text as="u" key={3} />,
                ]}
                defaults="When <0>checked</0>, {{appName}} will enrich notifications with detailed user and state information. You may also choose to display <1>notification metric pills</1> or <2>notification reference numbers</2>. When <3>unchecked</3>, {{appName}} will only fetch basic notification details."
                values={{ appName: APPLICATION.NAME }}
              />
              <Trans
                i18nKey="settings.notifications.fetch_detailed_caution"
                components={[<i key={0} />]}
                defaults="⚠️ Users with a large number of unread notifications <i>may</i> experience rate limiting under certain circumstances. Please disable this setting if you experience this."
              />
            </Stack>
          }
        />

        {detailedNotifications &&
          accounts.some(
            (account) => !hasRecommendedScopes(account) && !hasAlternateScopes(account),
          ) && (
            <Stack
              align="center"
              className="rounded-md px-3 py-2 bg-gitify-accounts text-xs"
              data-testid="settings-scope-warning"
              direction="horizontal"
              gap="condensed"
            >
              <AlertFillIcon className="text-gitify-warning" size={14} />
              <Trans
                i18nKey="settings.notifications.scope_warning"
                components={[
                  <button
                    className="text-gitify-link cursor-pointer"
                    key={0}
                    onClick={() => navigate('/accounts')}
                    type="button"
                  />,
                ]}
                defaults="One or more accounts are missing scopes required for notification enrichment. Notification details may be incomplete. Visit <0>Accounts → Scopes</0> to review."
              />
            </Stack>
          )}

        <div className="pl-6" hidden={!detailedNotifications}>
          <Stack direction="vertical" gap="condensed">
            <Checkbox
              checked={showPills}
              label={t('settings.notifications.show_pills', 'Show notification metric pills')}
              name="showPills"
              onChange={() => toggleSetting('showPills')}
              tooltip={
                <Stack direction="vertical" gap="condensed">
                  <Text>
                    {t(
                      'settings.notifications.show_pills_help',
                      'Show notification metric pills for:',
                    )}
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
                        {t('settings.notifications.pill_pr_reviews', 'pr reviews')}
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

            <Checkbox
              checked={showNumber}
              label={t('settings.notifications.show_number', 'Show GitHub number')}
              name="showNumber"
              onChange={() => toggleSetting('showNumber')}
              tooltip={
                <Stack direction="vertical" gap="condensed">
                  <Text>
                    {t('settings.notifications.show_number_help', 'Show GitHub number for:')}
                  </Text>
                  <div className="pl-2">
                    <Stack direction="vertical" gap="none">
                      <Stack direction="horizontal" gap="condensed">
                        <CommentIcon size={Size.SMALL} />
                        {t('settings.notifications.number_discussion', 'Discussion')}
                      </Stack>

                      <Stack direction="horizontal" gap="condensed">
                        <IssueOpenedIcon size={Size.SMALL} />
                        {t('settings.notifications.number_issue', 'Issue')}
                      </Stack>

                      <Stack direction="horizontal" gap="condensed">
                        <GitPullRequestIcon size={Size.SMALL} />
                        {t('settings.notifications.number_pull_request', 'Pull Request')}
                      </Stack>
                    </Stack>
                  </div>
                </Stack>
              }
            />
          </Stack>
        </div>

        <Checkbox
          checked={participating}
          label={t('settings.notifications.participating', 'Fetch only participating')}
          name="showOnlyParticipating"
          onChange={() => toggleSetting('participating')}
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Trans
                i18nKey="settings.notifications.participating_help"
                components={[
                  <Text as="u" key={0} />,
                  <Text as="u" key={1} />,
                  <button
                    className="text-gitify-link cursor-pointer"
                    key={2}
                    onClick={(event: MouseEvent<HTMLElement>) => {
                      // Don't trigger onClick of parent element.
                      event.stopPropagation();
                      openGitHubParticipatingDocs();
                    }}
                    title={t(
                      'settings.notifications.participating_docs_title',
                      'Open GitHub documentation for participating and watching notifications',
                    )}
                    type="button"
                  />,
                ]}
                defaults="When <0>checked</0>, {{appName}} will fetch only participating notifications. When <1>unchecked</1>, {{appName}} will fetch participating and watching notifications. See <2>official docs</2> for more details."
                values={{ appName: APPLICATION.NAME }}
              />
            </Stack>
          }
        />

        <Checkbox
          checked={fetchReadNotifications}
          label={t('settings.notifications.fetch_read', 'Fetch read & done notifications')}
          name="fetchReadNotifications"
          onChange={() => toggleSetting('fetchReadNotifications')}
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>
                {t(
                  'settings.notifications.fetch_read_help',
                  'Fetch all notifications including read and done.',
                )}
              </Text>
              <Text className="text-gitify-caution">
                {t(
                  'settings.notifications.fetch_read_done_caution',
                  "⚠️ GitHub's API does not distinguish between read and done states, so 'Mark as done' actions will be unavailable when this setting is enabled.",
                )}
              </Text>
              <Text className="text-gitify-caution">
                {t(
                  'settings.notifications.fetch_read_rate_caution',
                  '⚠️ Enabling this setting will increase API usage and may cause rate limiting for users with many notifications.',
                )}
              </Text>
            </Stack>
          }
        />

        <Checkbox
          checked={markAsDoneOnOpen}
          label={t('settings.notifications.mark_done_open', 'Mark as done on open')}
          name="markAsDoneOnOpen"
          onChange={() => toggleSetting('markAsDoneOnOpen')}
          tooltip={
            <Trans
              i18nKey="settings.notifications.mark_done_help"
              components={[<Text as="strong" key={0} />]}
              defaults="<0>Mark as done</0> feature is supported in GitHub Cloud and GitHub Enterprise Server 3.13 or later."
            />
          }
        />

        <Checkbox
          checked={markAsDoneOnUnsubscribe}
          label={t('settings.notifications.mark_done_unsubscribe', 'Mark as done on unsubscribe')}
          name="markAsDoneOnUnsubscribe"
          onChange={() => toggleSetting('markAsDoneOnUnsubscribe')}
          tooltip={
            <Trans
              i18nKey="settings.notifications.mark_done_help"
              components={[<Text as="strong" key={0} />]}
              defaults="<0>Mark as done</0> feature is supported in GitHub Cloud and GitHub Enterprise Server 3.13 or later."
            />
          }
        />

        <Checkbox
          checked={delayNotificationState}
          label={t('settings.notifications.delay_state', 'Delay notification state')}
          name="delayNotificationState"
          onChange={() => toggleSetting('delayNotificationState')}
          tooltip={
            <Text>
              {t(
                'settings.notifications.delay_state_help',
                'Keep the notification within {{appName}} upon interaction (ie: open notification, mark as read, mark as done) until the next refresh window (scheduled or user initiated).',
                { appName: APPLICATION.NAME },
              )}
            </Text>
          }
        />
      </Stack>
    </fieldset>
  );
};
