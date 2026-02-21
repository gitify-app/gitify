import { type FC, type MouseEvent, useState } from 'react';

import {
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

import { formatDuration, millisecondsToMinutes } from 'date-fns';

import { APPLICATION } from '../../../shared/constants';

import { Constants } from '../../constants';

import { GroupBy, useSettingsStore } from '../../stores';

import { Checkbox } from '../fields/Checkbox';
import { FieldLabel } from '../fields/FieldLabel';
import { RadioGroup } from '../fields/RadioGroup';
import { Title } from '../primitives/Title';

import { Size } from '../../types';

import { openGitHubParticipatingDocs } from '../../utils/links';

export const NotificationSettings: FC = () => {
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  const groupBy = useSettingsStore((s) => s.groupBy);
  const fetchAllNotifications = useSettingsStore(
    (s) => s.fetchAllNotifications,
  );
  const detailedNotifications = useSettingsStore(
    (s) => s.detailedNotifications,
  );
  const fetchInterval = useSettingsStore((s) => s.fetchInterval);
  const markAsDoneOnOpen = useSettingsStore((s) => s.markAsDoneOnOpen);
  const markAsDoneOnUnsubscribe = useSettingsStore(
    (s) => s.markAsDoneOnUnsubscribe,
  );
  const delayNotificationState = useSettingsStore(
    (s) => s.delayNotificationState,
  );
  const showPills = useSettingsStore((s) => s.showPills);
  const showNumber = useSettingsStore((s) => s.showNumber);
  const participating = useSettingsStore((s) => s.participating);
  const fetchReadNotifications = useSettingsStore(
    (s) => s.fetchReadNotifications,
  );

  const [localFetchInterval, setFetchInterval] = useState(fetchInterval);

  return (
    <fieldset>
      <Title icon={BellIcon}>Notifications</Title>

      <Stack direction="vertical" gap="condensed">
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
                <Text as="strong">Repository</Text> groups notifications by
                their repository full name.
              </Text>
              <Text>
                <Text as="strong">Date</Text> shows notifications in
                chronological order.
              </Text>
            </Stack>
          }
          value={groupBy}
        />

        <Stack
          align="center"
          className="text-sm"
          direction="horizontal"
          gap="condensed"
        >
          <FieldLabel label="Fetch interval:" name="fetchInterval" />

          <ButtonGroup className="ml-2">
            <IconButton
              aria-label="Decrease fetch interval"
              data-testid="settings-fetch-interval-decrease"
              icon={DashIcon}
              onClick={() => {
                const newInterval = Math.max(
                  fetchInterval -
                    Constants.FETCH_NOTIFICATIONS_INTERVAL_STEP_MS,
                  Constants.MIN_FETCH_NOTIFICATIONS_INTERVAL_MS,
                );

                if (newInterval !== fetchInterval) {
                  setFetchInterval(newInterval);
                  updateSetting('fetchInterval', newInterval);
                }
              }}
              size="small"
              unsafeDisableTooltip={true}
            />

            <Button aria-label="Fetch interval" disabled size="small">
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
                  fetchInterval +
                    Constants.FETCH_NOTIFICATIONS_INTERVAL_STEP_MS,
                  Constants.MAX_FETCH_NOTIFICATIONS_INTERVAL_MS,
                );

                if (newInterval !== fetchInterval) {
                  setFetchInterval(newInterval);
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
                setFetchInterval(
                  Constants.DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS,
                );
                updateSetting(
                  'fetchInterval',
                  Constants.DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS,
                );
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
          onChange={() =>
            updateSetting('fetchAllNotifications', !fetchAllNotifications)
          }
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>
                When <Text as="u">checked</Text>, {APPLICATION.NAME} will fetch{' '}
                <Text as="strong">all</Text> notifications from your inbox.
              </Text>
              <Text>
                When <Text as="u">unchecked</Text>, {APPLICATION.NAME} will
                fetch the first page of notifications (max 50 records per GitHub
                account)
              </Text>
            </Stack>
          }
        />

        <Checkbox
          checked={detailedNotifications}
          label="Fetch detailed notifications"
          name="detailedNotifications"
          onChange={() =>
            updateSetting('detailedNotifications', !detailedNotifications)
          }
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>
                When <Text as="u">checked</Text>, {APPLICATION.NAME} will enrich
                notifications with detailed user and state information. You may
                also choose to display{' '}
                <Text as="strong">notification metric pills</Text> or{' '}
                <Text as="strong">notification reference numbers</Text>.
              </Text>
              <Text>
                When <Text as="u">unchecked</Text>, {APPLICATION.NAME} will only
                fetch basic notification details.
              </Text>
              <Text className="text-gitify-caution">
                ⚠️ Users with a large number of unread notifications <i>may</i>{' '}
                experience rate limiting under certain circumstances. Please
                disable this setting if you experience this.
              </Text>
            </Stack>
          }
        />

        <div className="pl-6" hidden={!detailedNotifications}>
          <Stack direction="vertical" gap="condensed">
            <Checkbox
              checked={showPills}
              label="Show notification metric pills"
              name="showPills"
              onChange={() => updateSetting('showPills', !showPills)}
              tooltip={
                <Stack direction="vertical" gap="condensed">
                  <Text>Show notification metric pills for:</Text>
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

            <Checkbox
              checked={showNumber}
              label="Show GitHub number"
              name="showNumber"
              onChange={() => updateSetting('showNumber', !showNumber)}
              tooltip={
                <Stack direction="vertical" gap="condensed">
                  <Text>Show GitHub number for:</Text>
                  <div className="pl-2">
                    <Stack direction="vertical" gap="none">
                      <Stack direction="horizontal" gap="condensed">
                        <CommentIcon size={Size.SMALL} />
                        Discussion
                      </Stack>

                      <Stack direction="horizontal" gap="condensed">
                        <IssueOpenedIcon size={Size.SMALL} />
                        Issue
                      </Stack>

                      <Stack direction="horizontal" gap="condensed">
                        <GitPullRequestIcon size={Size.SMALL} />
                        Pull Request
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
          label="Fetch only participating"
          name="showOnlyParticipating"
          onChange={() => updateSetting('participating', !participating)}
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>
                When <Text as="u">checked</Text>, {APPLICATION.NAME} will fetch
                only participating notifications.
              </Text>
              <Text>
                When <Text as="u">unchecked</Text>, {APPLICATION.NAME} will
                fetch participating and watching notifications.
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
          checked={fetchReadNotifications}
          label="Fetch read & done notifications"
          name="fetchReadNotifications"
          onChange={() =>
            updateSetting('fetchReadNotifications', !fetchReadNotifications)
          }
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>Fetch all notifications including read and done.</Text>
              <Text className="text-gitify-caution">
                ⚠️ GitHub's API does not distinguish between read and done
                states, so 'Mark as done' actions will be unavailable when this
                setting is enabled.
              </Text>
              <Text className="text-gitify-caution">
                ⚠️ Enabling this setting will increase API usage and may cause
                rate limiting for users with many notifications.
              </Text>
            </Stack>
          }
        />

        <Checkbox
          checked={markAsDoneOnOpen}
          label="Mark as done on open"
          name="markAsDoneOnOpen"
          onChange={() => updateSetting('markAsDoneOnOpen', !markAsDoneOnOpen)}
          tooltip={
            <Text>
              <Text as="strong">Mark as done</Text> feature is supported in
              GitHub Cloud and GitHub Enterprise Server 3.13 or later.
            </Text>
          }
        />

        <Checkbox
          checked={markAsDoneOnUnsubscribe}
          label="Mark as done on unsubscribe"
          name="markAsDoneOnUnsubscribe"
          onChange={() =>
            updateSetting('markAsDoneOnUnsubscribe', !markAsDoneOnUnsubscribe)
          }
          tooltip={
            <Text>
              <Text as="strong">Mark as done</Text> feature is supported in
              GitHub Cloud and GitHub Enterprise Server 3.13 or later.
            </Text>
          }
        />

        <Checkbox
          checked={delayNotificationState}
          label="Delay notification state"
          name="delayNotificationState"
          onChange={() =>
            updateSetting('delayNotificationState', !delayNotificationState)
          }
          tooltip={
            <Text>
              Keep the notification within {APPLICATION.NAME} upon interaction
              (ie: open notification, mark as read, mark as done) until the next
              refresh window (scheduled or user initiated).
            </Text>
          }
        />
      </Stack>
    </fieldset>
  );
};
