import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  AlertFillIcon,
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
import { Button, ButtonGroup, IconButton, Stack, Text } from '@primer/react';

import { formatDuration } from 'date-fns/formatDuration';
import { millisecondsToMinutes } from 'date-fns/millisecondsToMinutes';

import { APPLICATION } from '../../../shared/constants';

import { Constants } from '../../constants';

import { useAccountsStore, useSettingsStore } from '../../stores';

import { Checkbox } from '../fields/Checkbox';
import { FieldLabel } from '../fields/FieldLabel';
import { RadioGroup } from '../fields/RadioGroup';
import { SectionHeading } from '../primitives/SectionHeading';

import { GroupBy, Size } from '../../types';

import { isMarkAsDoneFeatureSupported } from '../../utils/api/features';
import { hasAlternateScopes, hasRecommendedScopes } from '../../utils/auth/scopes';
import { openGitHubParticipatingDocs } from '../../utils/system/links';
import { SettingsGroupHeading } from './SettingsGroupHeading';

export function InboxSettings() {
  const navigate = useNavigate();

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
        Inbox
      </SectionHeading>

      <Stack direction="vertical" gap="condensed">
        <SettingsGroupHeading icon={DownloadIcon}>Fetching</SettingsGroupHeading>

        <Stack align="center" className="text-sm" direction="horizontal" gap="condensed">
          <FieldLabel
            label="Fetch interval:"
            name="fetchInterval"
            tooltip={
              <Text>
                Set how often Gitify checks for new notifications. Shorter intervals check more
                often and use more API requests.
              </Text>
            }
          />

          <ButtonGroup className="ml-2">
            <IconButton
              aria-label="Decrease fetch interval"
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
              aria-label="Fetch interval"
              className="pointer-events-none"
              size="small"
              tabIndex={-1}
            >
              {formatDuration({
                minutes: millisecondsToMinutes(fetchInterval),
              })}
            </Button>

            <IconButton
              aria-label="Increase fetch interval"
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
              aria-label="Reset fetch interval"
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
          label="Fetch all notifications"
          name="fetchAllNotifications"
          onChange={() => toggleSetting('fetchAllNotifications')}
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>
                When <Text as="u">checked</Text>, {APPLICATION.NAME} will fetch{' '}
                <Text as="strong">all</Text> notifications from your inbox.
              </Text>
              <Text>
                When <Text as="u">unchecked</Text>, {APPLICATION.NAME} will fetch the first page of
                notifications (max 50 records per GitHub account)
              </Text>
            </Stack>
          }
        />

        <Checkbox
          checked={fetchReadNotifications}
          label="Fetch read and done notifications"
          name="fetchReadNotifications"
          onChange={() => toggleSetting('fetchReadNotifications')}
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>Fetch all notifications including read and done.</Text>
              <Text className="text-gitify-caution">
                ⚠️ GitHub's API does not distinguish between read and done states, so 'Mark as done'
                actions will be unavailable when this setting is enabled.
              </Text>
              <Text className="text-gitify-caution">
                ⚠️ Enabling this setting will increase API usage and may cause rate limiting for
                users with many notifications.
              </Text>
            </Stack>
          }
        />

        <SettingsGroupHeading icon={ListUnorderedIcon}>List</SettingsGroupHeading>

        <RadioGroup
          label="Group by:"
          name="groupBy"
          onChange={(evt) => {
            updateSetting('groupBy', evt.target.value as GroupBy);
          }}
          options={[
            { label: 'Repository', value: GroupBy.REPOSITORY },
            { label: 'Date', value: GroupBy.DATE },
          ]}
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>Choose how notifications are displayed in the list.</Text>
              <Text>
                <Text as="strong">Repository</Text> groups notifications by their repository full
                name.
              </Text>
              <Text>
                <Text as="strong">Date</Text> shows notifications in chronological order.
              </Text>
            </Stack>
          }
          value={groupBy}
        />

        <Checkbox
          checked={showAccountHeader}
          label="Show account header"
          name="showAccountHeader"
          onChange={() => toggleSetting('showAccountHeader')}
          tooltip={
            <Text>
              When enabled, displays an account header (avatar, username and quick links) above the
              notifications list.
            </Text>
          }
          visible={!hasMultipleAccounts}
        />

        <Checkbox
          checked={wrapNotificationTitle}
          label="Show full notification title"
          name="wrapNotificationTitle"
          onChange={() => toggleSetting('wrapNotificationTitle')}
          tooltip={
            <Text>
              Wrap long notification titles onto multiple lines instead of truncating with an
              ellipsis. This shows the full title but may increase the height of the notification
              list.
            </Text>
          }
        />

        <Checkbox
          checked={showNumber}
          label="Show reference"
          name="showNumber"
          onChange={() => toggleSetting('showNumber')}
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>Show the notification reference where available:</Text>
              <div className="pl-2">
                <Stack direction="vertical" gap="none">
                  <Stack align="center" direction="horizontal" gap="condensed">
                    <CommentIcon size={Size.SMALL} />
                    <Text>Discussion</Text>
                    <Text className="text-gitify-icon-muted">#123</Text>
                  </Stack>

                  <Stack align="center" direction="horizontal" gap="condensed">
                    <IssueOpenedIcon size={Size.SMALL} />
                    <Text>Issue</Text>
                    <Text className="text-gitify-icon-muted">#123</Text>
                  </Stack>

                  <Stack align="center" direction="horizontal" gap="condensed">
                    <GitPullRequestIcon size={Size.SMALL} />
                    <Text>Pull Request</Text>
                    <Text className="text-gitify-icon-muted">#123</Text>
                  </Stack>

                  <Stack align="center" direction="horizontal" gap="condensed">
                    <GitCommitIcon size={Size.SMALL} />
                    <Text>Commit</Text>
                    <Text className="text-gitify-icon-muted">a1b2c3d</Text>
                  </Stack>

                  <Stack align="center" direction="horizontal" gap="condensed">
                    <ReleaseIcon size={Size.SMALL} />
                    <Text>Release</Text>
                    <Text className="text-gitify-icon-muted">v1.2.3</Text>
                  </Stack>
                </Stack>
              </div>
            </Stack>
          }
        />

        <Checkbox
          checked={delayNotificationState}
          label="Delay notification removal"
          name="delayNotificationState"
          onChange={() => toggleSetting('delayNotificationState')}
          tooltip={
            <Text>
              Keep the notification within {APPLICATION.NAME} upon interaction (ie: open
              notification, mark as read, mark as done) until the next refresh window (scheduled or
              user initiated).
            </Text>
          }
        />

        {hasGitHubAccount ? (
          <>
            <SettingsGroupHeading icon={MarkGithubIcon}>GitHub</SettingsGroupHeading>

            <Checkbox
              checked={participating}
              label="Fetch only participating"
              name="showOnlyParticipating"
              onChange={() => toggleSetting('participating')}
              tooltip={
                <Stack direction="vertical" gap="condensed">
                  <Text>
                    When <Text as="u">checked</Text>, {APPLICATION.NAME} will fetch only
                    participating notifications.
                  </Text>
                  <Text>
                    When <Text as="u">unchecked</Text>, {APPLICATION.NAME} will fetch participating
                    and watching notifications.
                  </Text>
                  <Text>
                    See{' '}
                    <button
                      className="text-gitify-link cursor-pointer"
                      onClick={(event: MouseEvent<HTMLElement>) => {
                        // Don't trigger onClick of parent element.
                        event.stopPropagation();
                        openGitHubParticipatingDocs();
                      }}
                      title="Open GitHub documentation for participating and watching notifications"
                      type="button"
                    >
                      official docs
                    </button>{' '}
                    for more details.
                  </Text>
                </Stack>
              }
            />

            <Checkbox
              checked={detailedNotifications}
              label="Fetch detailed notifications"
              name="detailedNotifications"
              onChange={() => toggleSetting('detailedNotifications')}
              tooltip={
                <Stack direction="vertical" gap="condensed">
                  <Text>
                    When <Text as="u">checked</Text>, {APPLICATION.NAME} will enrich notifications
                    with detailed user and state information. You may also choose to display{' '}
                    <Text as="strong">notification metrics</Text>.
                  </Text>
                  <Text>
                    When <Text as="u">unchecked</Text>, {APPLICATION.NAME} will only fetch basic
                    notification details.
                  </Text>
                  <Text className="text-gitify-caution">
                    ⚠️ Users with a large number of unread notifications <i>may</i> experience rate
                    limiting under certain circumstances. Please disable this setting if you
                    experience this.
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
                <Stack
                  align="center"
                  className="rounded-md px-3 py-2 bg-gitify-accounts text-xs"
                  data-testid="settings-scope-warning"
                  direction="horizontal"
                  gap="condensed"
                >
                  <AlertFillIcon className="text-gitify-warning" size={14} />
                  <Stack direction="vertical" gap="condensed">
                    <Text>
                      One or more accounts are missing scopes required for notification enrichment.
                      Notification details may be incomplete.
                    </Text>
                    <Text>
                      Visit{' '}
                      <button
                        className="text-gitify-link cursor-pointer"
                        onClick={() => navigate('/accounts')}
                        type="button"
                      >
                        Accounts → Scopes
                      </button>{' '}
                      to review.
                    </Text>
                  </Stack>
                </Stack>
              )}

            <div className="pl-6" hidden={!detailedNotifications}>
              <Checkbox
                checked={showPills}
                label="Show notification metrics"
                name="showPills"
                onChange={() => toggleSetting('showPills')}
                tooltip={
                  <Stack direction="vertical" gap="condensed">
                    <Text>Show notification metrics for:</Text>
                    <div className="pl-2">
                      <Stack direction="vertical" gap="none">
                        <Stack direction="horizontal" gap="condensed">
                          <IssueOpenedIcon size={Size.SMALL} />
                          linked issues
                        </Stack>
                        <Stack direction="horizontal" gap="condensed">
                          <SmileyIcon size={Size.SMALL} />
                          reactions
                        </Stack>
                        <Stack direction="horizontal" gap="condensed">
                          <CheckIcon size={Size.SMALL} />
                          pr reviews
                        </Stack>
                        <Stack direction="horizontal" gap="condensed">
                          <CommentIcon size={Size.SMALL} />
                          comments
                        </Stack>
                        <Stack direction="horizontal" gap="condensed">
                          <TagIcon size={Size.SMALL} />
                          labels
                        </Stack>
                        <Stack direction="horizontal" gap="condensed">
                          <MilestoneIcon size={Size.SMALL} />
                          milestones
                        </Stack>
                      </Stack>
                    </div>
                  </Stack>
                }
              />
            </div>

            <Checkbox
              checked={markAsDoneOnOpen}
              disabled={!hasMarkAsDoneAccount}
              label="Mark as done on open"
              name="markAsDoneOnOpen"
              onChange={() => toggleSetting('markAsDoneOnOpen')}
              tooltip={
                <Text>
                  <Text as="strong">Mark as done</Text> is supported in GitHub Cloud and GitHub
                  Enterprise Server 3.13 or later.
                </Text>
              }
            />

            <Checkbox
              checked={markAsDoneOnUnsubscribe}
              disabled={!hasMarkAsDoneAccount}
              label="Mark as done on unsubscribe"
              name="markAsDoneOnUnsubscribe"
              onChange={() => toggleSetting('markAsDoneOnUnsubscribe')}
              tooltip={
                <Text>
                  <Text as="strong">Mark as done</Text> is supported in GitHub Cloud and GitHub
                  Enterprise Server 3.13 or later.
                </Text>
              }
            />

            {!hasMarkAsDoneAccount && (
              <Text className="text-xs text-gitify-caution">
                Mark as done requires GitHub Cloud or GitHub Enterprise Server 3.13 or later.
              </Text>
            )}
          </>
        ) : (
          <Text className="text-xs text-gitify-icon-muted">
            GitHub-specific options require a GitHub account.
          </Text>
        )}
      </Stack>
    </fieldset>
  );
}
