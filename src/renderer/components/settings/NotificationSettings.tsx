import { type FC, type MouseEvent, useContext } from 'react';

import { BellIcon } from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

import { APPLICATION } from '../../../shared/constants';
import { AppContext } from '../../context/App';
import { GroupBy } from '../../types';
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
                When <Text as="em">checked</Text>, Gitify will fetch{' '}
                <Text as="strong">all</Text> notifications from your inbox.
              </Text>
              <Text>
                When <Text as="em">unchecked</Text>, Gitify will only fetch the
                first page of notifications (max 50 records per GitHub account)
              </Text>
            </Stack>
          }
        />

        <Checkbox
          name="showOnlyParticipating"
          label="Show only participating"
          checked={settings.participating}
          onChange={(evt) => updateSetting('participating', evt.target.checked)}
          tooltip={
            <Text>
              See{' '}
              <button
                type="button"
                className="text-gitify-link"
                title="Open GitHub documentation for participating and watching notifications"
                onClick={(event: MouseEvent<HTMLElement>) => {
                  // Don't trigger onClick of parent element.
                  event.stopPropagation();
                  openGitHubParticipatingDocs();
                }}
              >
                official docs
              </button>{' '}
              for more details.
            </Text>
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
      </Stack>
    </fieldset>
  );
};
