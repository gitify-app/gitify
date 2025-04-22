import { type FC, type MouseEvent, useContext } from 'react';

import {
  BellIcon,
  CheckIcon,
  CommentIcon,
  GitPullRequestIcon,
  IssueClosedIcon,
  MilestoneIcon,
  TagIcon,
} from '@primer/octicons-react';
import { Box, Stack, Text } from '@primer/react';

import { APPLICATION } from '../../../shared/constants';
import { AppContext } from '../../context/App';
import { GroupBy, Size } from '../../types';
import { openGitHubParticipatingDocs } from '../../utils/links';
import { Checkbox } from '../fields/Checkbox';
import { RadioGroup } from '../fields/RadioGroup';
import { Title } from '../primitives/Title';

export const NotificationSettings: FC = () => {
  const { settings, updateSetting } = useContext(AppContext);

  return (
    <fieldset>
      <Title icon={BellIcon}>Notifications</Title>

      <Stack direction="vertical" gap="condensed">
        <RadioGroup
          name="groupBy"
          label="Group by:"
          value={settings.groupBy}
          options={[
            { label: 'Repository', value: GroupBy.REPOSITORY },
            { label: 'Date', value: GroupBy.DATE },
          ]}
          onChange={(evt) => {
            updateSetting('groupBy', evt.target.value as GroupBy);
          }}
        />

        <Checkbox
          name="fetchAllNotifications"
          label="Fetch all notifications"
          checked={settings.fetchAllNotifications}
          onChange={(evt) =>
            updateSetting('fetchAllNotifications', evt.target.checked)
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
          name="detailedNotifications"
          label="Fetch detailed notifications"
          checked={settings.detailedNotifications}
          onChange={(evt) =>
            updateSetting('detailedNotifications', evt.target.checked)
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

        <Box className="pl-6" hidden={!settings.detailedNotifications}>
          <Stack direction="vertical" gap="condensed">
            <Checkbox
              name="showPills"
              label="Show notification metric pills"
              checked={settings.showPills}
              onChange={(evt) => updateSetting('showPills', evt.target.checked)}
              tooltip={
                <Stack direction="vertical" gap="condensed">
                  <Text>Show notification metric pills for:</Text>
                  <Box className="pl-4">
                    <Stack direction="vertical" gap="none">
                      <Stack direction="horizontal" gap="condensed">
                        <IssueClosedIcon size={Size.SMALL} />
                        linked issues
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
                  </Box>
                </Stack>
              }
            />

            <Checkbox
              name="showNumber"
              label="Show GitHub number"
              checked={settings.showNumber}
              onChange={(evt) =>
                updateSetting('showNumber', evt.target.checked)
              }
              tooltip={
                <Stack direction="vertical" gap="condensed">
                  <Text>Show GitHub number for:</Text>
                  <Box className="pl-4">
                    <ul>
                      <li>
                        <Stack direction="horizontal" gap="condensed">
                          <CommentIcon size={Size.SMALL} />
                          Discussion
                        </Stack>
                      </li>
                      <li>
                        <Stack direction="horizontal" gap="condensed">
                          <IssueClosedIcon size={Size.SMALL} />
                          Issue
                        </Stack>
                      </li>
                      <li>
                        <Stack direction="horizontal" gap="condensed">
                          <GitPullRequestIcon size={Size.SMALL} />
                          Pull Request
                        </Stack>
                      </li>
                    </ul>
                  </Box>
                </Stack>
              }
            />
          </Stack>
        </Box>

        <Checkbox
          name="showOnlyParticipating"
          label="Fetch only participating"
          checked={settings.participating}
          onChange={(evt) => updateSetting('participating', evt.target.checked)}
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>
                When <Text as="u">checked</Text>, {APPLICATION.NAME} will fetch
                only participating notifications.
              </Text>
              <Text>
                When <Text as="em">unchecked</Text>, {APPLICATION.NAME} will
                fetch participating and watching notifications.
              </Text>
              <Text>
                See{' '}
                <Box
                  className="text-gitify-link cursor-pointer"
                  title="Open GitHub documentation for participating and watching notifications"
                  onClick={(event: MouseEvent<HTMLElement>) => {
                    // Don't trigger onClick of parent element.
                    event.stopPropagation();
                    openGitHubParticipatingDocs();
                  }}
                >
                  official docs
                </Box>{' '}
                for more details.
              </Text>
            </Stack>
          }
        />

        <Checkbox
          name="markAsDoneOnOpen"
          label="Mark as done on open"
          checked={settings.markAsDoneOnOpen}
          onChange={(evt) =>
            updateSetting('markAsDoneOnOpen', evt.target.checked)
          }
          tooltip={
            <Text>
              <Text as="strong">Mark as done</Text> feature is supported in
              GitHub Cloud and GitHub Enterprise Server 3.13 or later.
            </Text>
          }
        />

        <Checkbox
          name="markAsDoneOnUnsubscribe"
          label="Mark as done on unsubscribe"
          checked={settings.markAsDoneOnUnsubscribe}
          onChange={(evt) =>
            updateSetting('markAsDoneOnUnsubscribe', evt.target.checked)
          }
          tooltip={
            <Text>
              <Text as="strong">Mark as done</Text> feature is supported in
              GitHub Cloud and GitHub Enterprise Server 3.13 or later.
            </Text>
          }
        />

        <Checkbox
          name="delayNotificationState"
          label="Delay notification state"
          checked={settings.delayNotificationState}
          onChange={(evt) =>
            updateSetting('delayNotificationState', evt.target.checked)
          }
          tooltip={
            <Text>
              Keep the notification within {APPLICATION.NAME} upon interaction
              (ie: open notification, mark as read, mark as done) until the next
              refresh window (scheduled or user initiated).
            </Text>
          }
        />

        <Box>
          <Text as="label" htmlFor="notificationVolume">
            Notification Volume: {settings.notificationVolume}%
          </Text>
          <input
            id="notificationVolume"
            type="range"
            min={0}
            max={100}
            step={1}
            value={settings.notificationVolume}
            onChange={(evt) =>
              updateSetting(
                'notificationVolume',
                Number.parseInt(evt.target.value, 10),
              )
            }
          />
        </Box>
      </Stack>
    </fieldset>
  );
};
