import { type FC, type MouseEvent, useContext } from 'react';

import {
  BellIcon,
  CheckIcon,
  CommentIcon,
  GitPullRequestIcon,
  IssueOpenedIcon,
  MilestoneIcon,
  TagIcon,
} from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

import { APPLICATION } from '../../../shared/constants';

import { AppContext } from '../../context/App';
import { FetchType, GroupBy, Size } from '../../types';
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
          label="Group by:"
          name="groupBy"
          onChange={(evt) => {
            updateSetting('groupBy', evt.target.value as GroupBy);
          }}
          options={[
            { label: 'Repository', value: GroupBy.REPOSITORY },
            { label: 'Date', value: GroupBy.DATE },
          ]}
          value={settings.groupBy}
        />

        <RadioGroup
          label="Fetch type:"
          name="fetchType"
          onChange={(evt) => {
            updateSetting('fetchType', evt.target.value as FetchType);
          }}
          options={[
            { label: 'Interval', value: FetchType.INTERVAL },
            { label: 'Inactivity', value: FetchType.INACTIVITY },
          ]}
          value={settings.fetchType}
        />

        <Checkbox
          checked={settings.fetchAllNotifications}
          label="Fetch all notifications"
          name="fetchAllNotifications"
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
          checked={settings.detailedNotifications}
          label="Fetch detailed notifications"
          name="detailedNotifications"
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

        <div className="pl-6" hidden={!settings.detailedNotifications}>
          <Stack direction="vertical" gap="condensed">
            <Checkbox
              checked={settings.showPills}
              label="Show notification metric pills"
              name="showPills"
              onChange={(evt) => updateSetting('showPills', evt.target.checked)}
              tooltip={
                <Stack direction="vertical" gap="condensed">
                  <Text>Show notification metric pills for:</Text>
                  <div className="pl-4">
                    <Stack direction="vertical" gap="none">
                      <Stack direction="horizontal" gap="condensed">
                        <IssueOpenedIcon size={Size.SMALL} />
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
                  </div>
                </Stack>
              }
            />

            <Checkbox
              checked={settings.showNumber}
              label="Show GitHub number"
              name="showNumber"
              onChange={(evt) =>
                updateSetting('showNumber', evt.target.checked)
              }
              tooltip={
                <Stack direction="vertical" gap="condensed">
                  <Text>Show GitHub number for:</Text>
                  <div className="pl-4">
                    <ul>
                      <li>
                        <Stack direction="horizontal" gap="condensed">
                          <CommentIcon size={Size.SMALL} />
                          Discussion
                        </Stack>
                      </li>
                      <li>
                        <Stack direction="horizontal" gap="condensed">
                          <IssueOpenedIcon size={Size.SMALL} />
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
                  </div>
                </Stack>
              }
            />
          </Stack>
        </div>

        <Checkbox
          checked={settings.participating}
          label="Fetch only participating"
          name="showOnlyParticipating"
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
          checked={settings.markAsDoneOnOpen}
          label="Mark as done on open"
          name="markAsDoneOnOpen"
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
          checked={settings.markAsDoneOnUnsubscribe}
          label="Mark as done on unsubscribe"
          name="markAsDoneOnUnsubscribe"
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
          checked={settings.delayNotificationState}
          label="Delay notification state"
          name="delayNotificationState"
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
      </Stack>
    </fieldset>
  );
};
